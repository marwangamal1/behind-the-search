from django.contrib.auth.forms import UserCreationForm
from django import forms
from .models import CustomUser
from django import forms


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ['full_name', 'email', 'username',
                  'password1', 'password2', 'phone_number']


    def clean_email(self):
        email = self.cleaned_data.get('email')
        if CustomUser.objects.filter(email=email).exists():
            raise forms.ValidationError("Email is already in use.")
        return email
