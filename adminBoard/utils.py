from django.db.models import Q
from users.models import CustomUser


def searchusers(request):
    search_query = ''

    if request.GET.get('search_query'):
        search_query = request.GET.get('search_query')

    users = CustomUser.objects.distinct().filter(
    Q(username__icontains=search_query) |
    Q(email__icontains=search_query) |
    Q(phone_number=search_query)
    ).exclude(
    Q(is_staff=True) | Q(is_superuser=True) | Q(access=False)
    )

    return users, search_query