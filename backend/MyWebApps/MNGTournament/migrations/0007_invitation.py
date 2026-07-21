from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('MNGTournament', '0006_player_role'),
    ]

    operations = [
        migrations.CreateModel(
            name='Invitation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pending', 'Pendiente'), ('accepted', 'Aceptada'), ('rejected', 'Rechazada')], default='pending', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invitations', to='MNGTournament.team')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invitations', to='MNGTournament.player')),
            ],
            options={
                'db_table': 'invitations',
                'ordering': ['-created_at'],
                'unique_together': {('team', 'player')},
            },
        ),
    ]
