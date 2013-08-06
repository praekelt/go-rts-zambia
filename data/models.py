from django.db import models
from hierarchy.models import School


class SchoolData(models.Model):
    EMIS_id = models.ForeignKey('School',
                                related_name='EMIS_id',
                                verbose_name=u'EMIS Number')
    classroom_total = models.IntegerField()
    teachers_total = models.IntegerField()
    g1_teachers = models.IntegerField()
    g2_teachers = models.IntegerField()
    boys_total = models.IntegerField()
    girls_total = models.IntegerField()
    g2_boys = models.IntegerField()
    g2_girls = models.IntegerField()

    def __unicode__(self):
        return self.EMIS_id

    class Meta:
        verbose_name_plural = "School Data"


class HeadTeacher(models.Model):
    first_name = models.CharField(max_length=50, verbose_name=u'First Name')
    last_name = models.CharField(max_length=50, verbose_name=u'Last Name')
    gender = models.CharField(max_length=2, verbose_name=u'Gender',
                              choices =(("M", "Male"), ("F", "Female")))
    mobile_number = models.IntegerField()
    date_of_birth = models.DateField()
    is_zonal_head = models.BooleanField()
    EMIS_id = models.ForeignKey(School,
                                related_name="EMIS_id",
                                verbose_name=u'EMIS Number')
    year = models.DateField()

    def __unicode__(self):
        return "%s %S" % (self.first_name, self.last_name)

    class Meta:
        verbose_name_plural = "Head Teacher"
