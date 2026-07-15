from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MNGTournament', '0005_alter_team_logoUrl'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='role',
            field=models.CharField(
                choices=[
                    ('admin', 'Administrador'),
                    ('captain', 'Capitán'),
                    ('player', 'Jugador'),
                ],
                default='player',
                max_length=15,
            ),
        ),
    ]
