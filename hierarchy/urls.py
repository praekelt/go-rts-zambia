from django.conf.urls import patterns, url, include
from hierarchy.api import SchoolResource
from tastypie.api import Api


# Setting the API base name and registering the API resources using
# Tastypies API function
api_resources = Api(api_name='v1')
api_resources.register(SchoolResource())
api_resources.prepend_urls()

# Setting the urlpatterns to hook into the api urls
urlpatterns = patterns('',
    url(r'^api/', include(api_resources.urls))
)
