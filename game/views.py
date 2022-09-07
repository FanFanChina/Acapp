from django.http import HttpResponse

def index(request):
    line1 = '<h1>一号老婆<h1>'
    line2 = '<img src = "https://cdn.jsdelivr.net/gh/FanFanChina/StaticFiles/images/8A8953536552D9121F1CFEEF2C8E601B.jpg">'
    return HttpResponse(line1 + line2)
def play(request):
    s = '<h1 style = "text-align: center">Play Interface</h1>'
    return HttpResponse(s)