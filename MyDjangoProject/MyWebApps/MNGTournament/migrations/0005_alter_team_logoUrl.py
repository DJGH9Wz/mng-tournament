from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MNGTournament', '0004_teammember'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='logoUrl',
            field=models.TextField(blank=True, null=True),
        ),
    ]
