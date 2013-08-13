from tastypie.resources import ModelResource, ALL_WITH_RELATIONS
from tastypie.authorization import Authorization
from tastypie import fields
from models import (HeadTeacher, SchoolData)
from django.conf.urls import url


class HeadTeacherResource(ModelResource):
    """
    POSTING DATA
    {
    "url": "<base_url>/api/data/headteacher/",,
    "method": "POST",
    "content_type": "application/json",
    "body": {
                "first_name": "abc",
                "last_name": "def",
                "created_at": "2012-10-12T10:00:00Z",
                "date_of_birth": "1962-10-12T10:00:00Z",
                "gender": "male",
                "msisdn": "0726961764",
                "emis": "/api/v1/school/emis/4811/"
            }

    GET SPECIFIC EMIS
    "url": "<base_url>/api/data/headteacher/?emis__emis=4817",,
    "method": "GET",
    """
    emis = fields.ForeignKey("hierarchy.api.SchoolResource", 'emis', full=True)

    class Meta:
        queryset = HeadTeacher.objects.all()
        resource_name = "data/headteacher"
        list_allowed_methods = ['post', 'get'] 
        authorization = Authorization()
        include_resource_uri = True
        always_return_data = True
        filtering = {
            'emis': ALL_WITH_RELATIONS}

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/emis/(?P<emis>[\w\d_.-]+)/$" % self._meta.resource_name, self.wrap_view('dispatch_detail'), name="api_dispatch_detail"),
        ]


class SchoolDataResource(ModelResource):
    """
    POSTING DATA

    "url": "<base_url>/api/data/schooldata/",
    "method": "POST",
    "content_type": "application/json",
    "body": {
                "name": "test_name",
                "classrooms": 30,
                "teachers": 40,
                "teachers_g1": 4,
                "teachers_g2": 8,
                "boys_g2": 15,
                "girls_g2": 12,
                "created_by": "/api/data/headteacher/emis/4813/",
                "emis": "/api/v1/school/emis/4813/"
            }
    """
    emis = fields.ForeignKey("hierarchy.api.SchoolResource", 'emis', full=True)
    created_by = fields.ForeignKey(HeadTeacherResource, 'created_by', full=True)

    class Meta:
        queryset = SchoolData.objects.all()
        resource_name = "data/schooldata"
        list_allowed_methods = ['post', 'get'] 
        authorization = Authorization()
        include_resource_uri = False
        always_return_data = True
        filtering = {
            'emis': ALL_WITH_RELATIONS}