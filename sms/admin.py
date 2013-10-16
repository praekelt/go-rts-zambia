from django.contrib import admin
from sms.models import SendSMS, SMSZones, TempSMSZones
from users.models import UserDistrict
from hierarchy.models import Zone, District
from django import forms
from django.forms.models import BaseInlineFormSet, inlineformset_factory
from django.contrib.admin.util import flatten_fieldsets
from functools import partial
from django.db import models
from sms.tasks import task_query_zone
from rts.utils import DistrictIdFilter, ManagePermissions
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from data.models import InboundSMS
from rts.actions import export_select_fields_csv_action


"""
The Code below overides the TempZonelClass thus adding extra variables to it,
that will be used by form.ModelForm to auto generate the required zones
dynamically
"""
zones = Zone.objects.all()
zones_dict = dict((obj.id, obj.name) for obj in zones)

for key, value in zones_dict.iteritems():
    TempSMSZones.add_to_class(str(key), models.BooleanField(value))


class SMSZoneForm(forms.ModelForm):
    all = forms.BooleanField(label="All", required=False)

    class Meta:
        model = TempSMSZones
        exclude = ["zone",
                   "send_sms",
                   "num_sent"]


class SendSMSForm(forms.ModelForm):

    sms = forms.CharField(widget=forms.Textarea(attrs={'cols': 80, 'rows': 20}))
    class Meta:
        models = SendSMS
        exclude = ["total_sent",
                    "replies",
                   "user",
                   "district",
                   "created_at"]

    def __init__(self, *args, **kwargs):
        super(SendSMSForm, self).__init__(*args, **kwargs)


class SMSZoneFormset(BaseInlineFormSet):
    def clean(self):
        super(SMSZoneFormset, self).clean()

        for form in self.forms:
            if not hasattr(form, 'cleaned_data'):
                continue

            data = dict((k, v) for k, v in form.cleaned_data.iteritems() if v)
            if "all" in data and len(data) > 2:
                raise forms.ValidationError("Choose all or specific zones not both")



class SMSZoneInline(admin.StackedInline):
    model = TempSMSZones
    form = SMSZoneForm
    formset = SMSZoneFormset
    max_num = 1

    def get_fieldsets(self, request, obj=None):
        fields_array = super(SMSZoneInline, self).get_fieldsets(request, obj=None)
        fields = fields_array[0][1]
        result = []
        temp = []
        if UserDistrict.objects.filter(user_id=request.user.id).exists():
            district = District.objects.get(id=request.user.userdistrict.district_id)
            zones = district.zone_set.all()
            query_dict = [temp.append(str(obj.id)) for obj in zones]

        for field in fields["fields"]:
            if field in temp:
                result.append(field)
        result.insert(0, "all")
        fields_array = [(None, {'fields': result})]
        return fields_array


class SendSMSAdmin(ManagePermissions):
    form = SendSMSForm
    inlines = [SMSZoneInline]
    list_display = ["sms", "created_by", "total_sent_messages", "replies", "district", "created_at"]

    def __init__(self, *args, **kwargs):
        super(SendSMSAdmin, self).__init__(*args, **kwargs)
        self.list_display_links = (None, )

    def has_add_permission(self, request):
        if not UserDistrict.objects.filter(user_id=request.user.id).exists():
            return False
        return True

    def has_change_permission(self, request, obj=None):
        if not UserDistrict.objects.filter(user_id=request.user.id).exists():
            return False
        return True

    def custom_save_zones(self, key, sms):
        """
        Repeated function to save zones
        """
        sms = SMSZones(send_sms=sms,
                        zone=Zone.objects.get(id=int(key)),
                        num_sent=50)
        sms.save()


    def change_view(self, request, object_id, form_url='', extra_context=None):
        """
        Not allowing the user to change content once sent
        """
        return HttpResponseRedirect(reverse("admin:sms_sendsms_changelist"))

    def save_model(self, request, obj, form, change):
        """
        Given a model instance save it to the database.
        """
        obj.user = request.user
        obj.district_id = request.user.userdistrict.district_id
        obj.save()


    def save_related(self, request, form, formsets, change):
        """
        Overriding save related to save ro real database instead of the dummy database
        """
        form.save_m2m()
        for formset in formsets:
            if UserDistrict.objects.filter(user_id=request.user.id).exists():
                district = District.objects.get(id=request.user.userdistrict.district_id)
                zones = district.zone_set.all()
                temp = [str(obj.id) for obj in zones]

            result = {}
            for key, value in formset.cleaned_data[0].iteritems():
                if value:
                    result[key] = value

            for key, value in result.iteritems():
                if key.isdigit() and key in temp:
                    self.custom_save_zones(key, result["temp_sms"])
                    task_query_zone.delay(int(key), result["temp_sms"].sms)

                elif key == 'all':
                    for zone_id in temp:
                        self.custom_save_zones(zone_id, result["temp_sms"])
                        task_query_zone.delay(zone_id, result["temp_sms"].sms)


class InboundSMSProxy(InboundSMS):
    class Meta:
        proxy = True
        app_label = "sms"
        verbose_name = "Inbound SMS"
        verbose_name_plural = "Inbound SMS's"
        db_table = "Inbound SMS"

class InboundSMSAdmin(ManagePermissions):
    list_display = ["message", "created_by", "created_at"]
    actions = [export_select_fields_csv_action("Export selected objects as CSV file")]

    def queryset(self, request):
        """
        Limits queries for pages that belong to district admin
        """
        qs = super(InboundSMSAdmin, self).queryset(request)
        return DistrictIdFilter(parent=self, request=request, qs=qs).queryset()

    def has_change_permission(self, request, obj=None):
        return True

    def has_add_permission(self, request):
        return True


admin.site.register(SendSMS, SendSMSAdmin)
admin.site.register(InboundSMSProxy, InboundSMSAdmin)
