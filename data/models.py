from django.db import models
import mockups
from mockups.generators import ChoiceGenerator, IntegerGenerator



class HeadTeacher(models.Model):
    first_name = models.CharField(max_length=50, verbose_name=u'First Name')
    last_name = models.CharField(max_length=50, verbose_name=u'Last Name')
    gender = models.CharField(max_length=6, verbose_name=u'Gender')
    msisdn = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    is_zonal_head = models.BooleanField()
    zonal_head_name = models.CharField(max_length=100, verbose_name=u'Zonal Head Name')
    created_at = models.DateTimeField(auto_now_add=True)
    emis = models.ForeignKey('hierarchy.School',
                             null=True,
                             blank=True,
                             verbose_name=u'EMIS Number')

    def __unicode__(self):
        return "%s %s" % (self.first_name, self.last_name)

    class Meta:
        verbose_name = "Head Teacher"


class SchoolData(models.Model):
    emis = models.ForeignKey('hierarchy.School',
                             verbose_name=u'EMIS Number')
    name = models.CharField(max_length=100, verbose_name=u'Name of School')
    classrooms = models.IntegerField()
    teachers = models.IntegerField()
    teachers_g1 = models.IntegerField()
    teachers_g2 = models.IntegerField()
    boys_g2 = models.IntegerField()
    girls_g2 = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(HeadTeacher,
                                    verbose_name=u'Teacher')

    def __unicode__(self):
        return "%s" % self.emis

    class Meta:
        verbose_name_plural = "School Data"


class AcademicAchievementCode(models.Model):
    achievement = models.CharField(max_length=50)

    def __unicode__(self):
        return "%s" % self.achievement

    class Meta:
        verbose_name = "Academic Achievment Code"


class TeacherPerfomanceData(models.Model):
    gender = models.CharField(max_length=6, verbose_name=u'Gender')
    age = models.IntegerField()
    years_experience = models.CharField(max_length=5)
    g2_pupils_present = models.IntegerField()
    g2_pupils_registered = models.IntegerField()
    classroom_environment_score = models.IntegerField()
    t_l_materials = models.IntegerField()
    pupils_materials_score = models.IntegerField()
    pupils_books_number = models.IntegerField()
    reading_lesson = models.IntegerField()
    pupil_engagment_score = models.IntegerField()
    attitudes_and_beliefs = models.IntegerField()
    training_subtotal = models.IntegerField()
    ts_number = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    academic_level = models.ForeignKey(AcademicAchievementCode,
                                    verbose_name=u'Academic Achievment Code')
    emis = models.ForeignKey('hierarchy.School',
                             verbose_name=u'emis Number')
    created_by = models.ForeignKey(HeadTeacher,
                                   verbose_name=u'Head Teacher')
    def __unicode__(self):
        return "%s" % self.emis

    class Meta:
        verbose_name_plural = "Teacher Perfomance Data"


class LearnerPerfomanceData(models.Model):
    gender = models.CharField(max_length=6, verbose_name=u'Gender')
    total_number_pupils = models.IntegerField()
    phonetic_awareness = models.IntegerField()
    vocabulary = models.IntegerField()
    reading_comprehension = models.IntegerField()
    writing_diction = models.IntegerField()
    below_minimum_results = models.IntegerField()
    minimum_results = models.IntegerField()
    desirable_results = models.IntegerField()
    outstanding_results = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    emis = models.ForeignKey('hierarchy.School',
                             verbose_name=u'EMIS Number')
    created_by = models.ForeignKey(HeadTeacher,
                                   verbose_name=u'Teacher')
    def __unicode__(self):
        return "%s" % self.emis

    class Meta:
        verbose_name_plural = "Learner Perfomance Data"


class InboundSMS(models.Model):
    message = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(HeadTeacher,
                                    verbose_name=u'Header Teacher')

    def __unicode__(self):
        return "%s" % self.message

    class Meta:
        verbose_name = "Inbound SMS"


# custom mockups for data generation

class GenderGenerator(ChoiceGenerator):
    choices = [u"male", u"female"]


class TeacherPerfomanceDataFactory(mockups.Factory):
    gender = GenderGenerator()
    age = IntegerGenerator(min_value=29, max_value=50)
    years_experience = IntegerGenerator(min_value=1, max_value=30)
    g2_pupils_present = IntegerGenerator(min_value=30, max_value=50)
    g2_pupils_registered = IntegerGenerator(min_value=30, max_value=50)
    classroom_environment_score = IntegerGenerator(min_value=1, max_value=10)
    t_l_materials = IntegerGenerator(min_value=1, max_value=10)
    pupils_materials_score = IntegerGenerator(min_value=1, max_value=10)
    pupils_books_number = IntegerGenerator(min_value=0, max_value=20)
    reading_lesson = IntegerGenerator(min_value=1, max_value=10)
    pupil_engagment_score = IntegerGenerator(min_value=1, max_value=10)
    attitudes_and_beliefs = IntegerGenerator(min_value=1, max_value=10)
    training_subtotal = IntegerGenerator(min_value=1, max_value=10)
    ts_number = IntegerGenerator(min_value=10000, max_value=99999)


class TeacherPerfomanceDataMockup(mockups.Mockup):
    factory = TeacherPerfomanceDataFactory


mockups.register(TeacherPerfomanceData, TeacherPerfomanceDataMockup)


class LearnerPerfomanceDataFactory(mockups.Factory):
    gender = GenderGenerator()
    total_number_pupils = IntegerGenerator(min_value=1, max_value=30)
    phonetic_awareness = IntegerGenerator(min_value=1, max_value=10)
    vocabulary = IntegerGenerator(min_value=1, max_value=10)
    reading_comprehension = IntegerGenerator(min_value=1, max_value=10)
    writing_diction = IntegerGenerator(min_value=1, max_value=10)
    below_minimum_results = IntegerGenerator(min_value=1, max_value=30)
    minimum_results = IntegerGenerator(min_value=1, max_value=10)
    desirable_results = IntegerGenerator(min_value=1, max_value=10)
    outstanding_results = IntegerGenerator(min_value=1, max_value=10)


class LearnerPerfomanceDataMockup(mockups.Mockup):
    factory = LearnerPerfomanceDataFactory


mockups.register(LearnerPerfomanceData, LearnerPerfomanceDataMockup)
