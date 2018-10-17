from django.conf.urls import include, url
from autism_prevalence_map import views

urlpatterns = [
    url(r'^map1/$', views.index1, name='index1'),
    url(r'^map2/$', views.index2, name='index2'),
    url(r'^list1/$', views.list_view1, name='list_view1'),
    url(r'^list2/$', views.list_view2, name='list_view2'),
    url(r'^about/$', views.about, name='about'),
    url(r'^studies-api/$', views.studiesApi, name='studiesApi'),
    url(r'^studies-csv/$', views.studiesCsv, name='studiesCsv'),

]
