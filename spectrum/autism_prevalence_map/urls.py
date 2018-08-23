from django.conf.urls import include, url
from autism_prevalence_map import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^studies-api/$', views.studiesApi, name='studiesApi'),
]
