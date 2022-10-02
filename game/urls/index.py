from django.urls import path, include
from game.views.index import index

urlpattenrns = [
    path("", index, name = "index"),
    path("menu/", include("game.urls.menu.index")),
    path("playground/", include("game.urls.playghround.index")),
    path("settings/", include("game.urls.settings.insex")),
]