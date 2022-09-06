from django.http import HttpResponse

def index(request):
    line  = '<h1 style = "text-align: center">Hello World<h1>'
    line1 = '<h1 style = "text-align: center">术士之战</h1>'
    line2 = '<img src = "https://cdn.jsdelivr.net/gh/FanFanChina/StaticFiles/images/8.jpg">'
    return HttpResponse(line + line1 + line2) 
def play(request):
    s = '<h1 style = "text-align: center">游戏界面</h1>'
    return HttpResponse(s)