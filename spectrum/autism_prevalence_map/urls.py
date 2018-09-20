from django.conf.urls import include, url
from autism_prevalence_map import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^list/$', views.list_view, name='list_view'),
    url(r'^about/$', views.about, name='about'),
    url(r'^studies-api/$', views.studiesApi, name='studiesApi'),
]
