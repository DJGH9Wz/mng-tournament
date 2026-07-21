# Backend - MNG Tournament

API REST construida con Django y Django REST Framework.

## Configuración

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Dependencias

- Django 5.2
- Django REST Framework
- drf-spectacular (documentación Swagger)
- django-cors-headers
- psycopg2-binary (PostgreSQL)

## Estructura

```
backend/
├── manage.py
├── requirements.txt
├── MyDjangoProject/       Configuración del proyecto Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── MyWebApps/
    └── MNGTournament/     Aplicación principal
        ├── models/        Modelos de datos (9 tablas)
        ├── views/         ViewSets de la API
        ├── serializers/   Serializadores DRF
        ├── urls.py        Rutas de la app
        └── management/    Comandos personalizados
```

## API Docs

Disponible en: `http://127.0.0.1:8000/api/docs/`
