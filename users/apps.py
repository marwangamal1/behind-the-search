from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
# {Ninja front Pass data}

    def ready(self):
        import users.signals  # Import signals when the app is ready
