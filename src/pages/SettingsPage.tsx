import { useEffect, useRef, useState } from 'react';
import {
  Save,
  School,
  MapPin,
  Phone,
  CalendarDays,
  Loader2,
  Upload,
  Trash2,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { Input, Select } from '@/components/Input';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { useI18n } from '@/i18n/I18nContext';

interface SchoolSettings {
  id: string;
  school_name: string;
  school_name_ar: string | null;
  school_name_en: string | null;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  wilaya: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  maps_url: string | null;
  school_year: string | null;
  start_date: string | null;
  end_date: string | null;
  default_language: 'fr' | 'ar' | 'en';
  created_at: string;
  updated_at: string;
}

interface SchoolHoliday {
  id: string | null;
  name_fr: string;
  name_ar: string;
  name_en: string;
  start_date: string;
  end_date: string;
}

const defaultHolidayRows: SchoolHoliday[] = [
  {
    id: null,
    name_fr: "Vacances d'hiver",
    name_ar: 'عطلة الشتاء',
    name_en: 'Winter break',
    start_date: '',
    end_date: '',
  },
  {
    id: null,
    name_fr: 'Vacances de printemps',
    name_ar: 'عطلة الربيع',
    name_en: 'Spring break',
    start_date: '',
    end_date: '',
  },
  {
    id: null,
    name_fr: "Vacances d'été",
    name_ar: 'العطلة الصيفية',
    name_en: 'Summer break',
    start_date: '',
    end_date: '',
  },
];

interface SettingsForm {
  school_name: string;
  school_name_ar: string;
  school_name_en: string;
  address: string;
  city: string;
  wilaya: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  latitude: string;
  longitude: string;
  maps_url: string;
  school_year: string;
  start_date: string;
  end_date: string;
  default_language: 'fr' | 'ar' | 'en';
}

const emptyForm: SettingsForm = {
  school_name: '',
  school_name_ar: '',
  school_name_en: '',
  address: '',
  city: '',
  wilaya: '',
  country: 'Algérie',
  phone: '',
  email: '',
  website: '',
  latitude: '',
  longitude: '',
  maps_url: '',
  school_year: '',
  start_date: '',
  end_date: '',
  default_language: 'fr',
};

export function SettingsPage() {
  const { showToast } = useToast();
  const { t, dir } = useI18n();

  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [holidays, setHolidays] = useState<SchoolHoliday[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const [savingHolidays, setSavingHolidays] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof SettingsForm>(
    field: K,
    value: SettingsForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const loadHolidays = async () => {
    setLoadingHolidays(true);

    const { data, error } = await supabase
      .from('school_holidays')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Erreur chargement vacances scolaires:', error);
      showToast(t('schoolHolidaysLoadError'), 'error');
      setHolidays(defaultHolidayRows);
      setLoadingHolidays(false);
      return;
    }

    if (!data || data.length === 0) {
      setHolidays(defaultHolidayRows);
    } else {
      setHolidays(
        data.map((holiday) => ({
          id: holiday.id,
          name_fr: holiday.name_fr ?? '',
          name_ar: holiday.name_ar ?? '',
          name_en: holiday.name_en ?? '',
          start_date: holiday.start_date ?? '',
          end_date: holiday.end_date ?? '',
        }))
      );
    }

    setLoadingHolidays(false);
  };

  const loadSettings = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('school_settings')
      .select('*')
      .eq('singleton_key', 'school')
      .maybeSingle();

    if (error) {
      console.error('Erreur chargement configuration:', error);
      showToast(
        t('settingsLoadError'),
        'error'
      );
      setLoading(false);
      return;
    }

    if (data) {
      const settings = data as SchoolSettings;

      setForm({
        school_name: settings.school_name ?? '',
        school_name_ar: settings.school_name_ar ?? '',
        school_name_en: settings.school_name_en ?? '',
        address: settings.address ?? '',
        city: settings.city ?? '',
        wilaya: settings.wilaya ?? '',
        country: settings.country ?? 'Algérie',
        phone: settings.phone ?? '',
        email: settings.email ?? '',
        website: settings.website ?? '',
        latitude:
          settings.latitude !== null
            ? String(settings.latitude)
            : '',
        longitude:
          settings.longitude !== null
            ? String(settings.longitude)
            : '',
        maps_url: settings.maps_url ?? '',
        school_year: settings.school_year ?? '',
        start_date: settings.start_date ?? '',
        end_date: settings.end_date ?? '',
        default_language: settings.default_language ?? 'fr',
      });

      setLogoUrl(settings.logo_url ?? null);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
    loadHolidays();
  }, []);

  const updateHoliday = <K extends keyof SchoolHoliday>(
    index: number,
    field: K,
    value: SchoolHoliday[K]
  ) => {
    setHolidays((prev) =>
      prev.map((holiday, i) =>
        i === index
          ? { ...holiday, [field]: value }
          : holiday
      )
    );
  };

  const addHoliday = () => {
    setHolidays((prev) => [
      ...prev,
      {
        id: null,
        name_fr: '',
        name_ar: '',
        name_en: '',
        start_date: '',
        end_date: '',
      },
    ]);
  };

  const removeHoliday = async (index: number) => {
    const holiday = holidays[index];

    if (!holiday) return;

    if (!holiday.id) {
      setHolidays((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    const { error } = await supabase
      .from('school_holidays')
      .delete()
      .eq('id', holiday.id);

    if (error) {
      console.error('Erreur suppression vacances:', error);
      showToast(t('schoolHolidayDeleteError'), 'error');
      return;
    }

    setHolidays((prev) => prev.filter((_, i) => i !== index));
    showToast(t('schoolHolidayDeleted'), 'success');
  };

  const saveHolidays = async () => {
    for (const holiday of holidays) {
      if (
        !holiday.name_fr.trim() ||
        !holiday.start_date ||
        !holiday.end_date
      ) {
        showToast(t('schoolHolidayRequired'), 'error');
        return false;
      }

      if (holiday.start_date > holiday.end_date) {
        showToast(t('schoolHolidayInvalidDates'), 'error');
        return false;
      }
    }

    setSavingHolidays(true);

    try {
      for (const holiday of holidays) {
        const payload = {
          name_fr: holiday.name_fr.trim(),
          name_ar: holiday.name_ar.trim() || null,
          name_en: holiday.name_en.trim() || null,
          start_date: holiday.start_date,
          end_date: holiday.end_date,
          updated_at: new Date().toISOString(),
        };

        if (holiday.id) {
          const { error } = await supabase
            .from('school_holidays')
            .update(payload)
            .eq('id', holiday.id);

          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from('school_holidays')
            .insert(payload)
            .select()
            .single();

          if (error) throw error;

          holiday.id = data.id;
        }
      }

      setHolidays((prev) =>
        prev.map((holiday) => ({ ...holiday }))
      );

      showToast(t('schoolHolidaysSaved'), 'success');
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde vacances:', error);
      showToast(t('schoolHolidaysSaveError'), 'error');
      return false;
    } finally {
      setSavingHolidays(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.school_name.trim()) {
      showToast(
        t('settingsNameRequired'),
        'error'
      );
      return;
    }

    setSaving(true);

    const latitude =
      form.latitude.trim() === ''
        ? null
        : Number(form.latitude);

    const longitude =
      form.longitude.trim() === ''
        ? null
        : Number(form.longitude);

    if (
      (latitude !== null && Number.isNaN(latitude)) ||
      (longitude !== null && Number.isNaN(longitude))
    ) {
      showToast(
        t('settingsGpsInvalid'),
        'error'
      );
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('school_settings')
      .update({
        school_name: form.school_name.trim(),
        school_name_ar: form.school_name_ar.trim() || null,
        school_name_en: form.school_name_en.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        wilaya: form.wilaya.trim() || null,
        country: form.country.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        website: form.website.trim() || null,
        latitude,
        longitude,
        maps_url: form.maps_url.trim() || null,
        school_year: form.school_year.trim() || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        default_language: form.default_language,
        updated_at: new Date().toISOString(),
      })
      .eq('singleton_key', 'school');

    if (error) {
      console.error(
        'Erreur sauvegarde configuration:',
        error
      );

      showToast(
        t('settingsSaveError'),
        'error'
      );

      setSaving(false);
      return;
    }

    showToast(
      t('settingsSaved'),
      'success'
    );

    setSaving(false);
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Vérification du type
    if (!file.type.startsWith('image/')) {
      showToast(
        t('settingsImageRequired'),
        'error'
      );

      event.target.value = '';
      return;
    }

    // Limite de taille : 5 Mo
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      showToast(
        t('settingsLogoTooLarge'),
        'error'
      );

      event.target.value = '';
      return;
    }

    setUploadingLogo(true);

    try {
      /*
       * On utilise toujours le même emplacement :
       * school-assets/logo
       *
       * upsert: true permet de remplacer
       * automatiquement l'ancien logo.
       */
      const fileExtension =
        file.name.split('.').pop()?.toLowerCase() || 'png';

      const filePath = `logo.${fileExtension}`;

      const { error: uploadError } =
        await supabase.storage
          .from('school-assets')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type,
          });

      if (uploadError) {
        console.error(
          'Erreur upload logo:',
          uploadError
        );

        showToast(
          `${t('settingsLogoUploadError')} ${uploadError.message}`,
          'error'
        );

        setUploadingLogo(false);
        event.target.value = '';
        return;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from('school-assets')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } =
        await supabase
          .from('school_settings')
          .update({
            logo_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('singleton_key', 'school');

      if (updateError) {
        console.error(
          'Erreur sauvegarde URL logo:',
          updateError
        );

        showToast(
          t('settingsLogoUrlError'),
          'error'
        );

        setUploadingLogo(false);
        event.target.value = '';
        return;
      }

      setLogoUrl(publicUrl);

      showToast(
        t('settingsLogoSaved'),
        'success'
      );
    } catch (error) {
      console.error('Erreur logo:', error);

      showToast(
        t('settingsLogoUnexpectedError'),
        'error'
      );
    }

    setUploadingLogo(false);
    event.target.value = '';
  };

  const handleRemoveLogo = async () => {
    if (!logoUrl) {
      return;
    }

    setUploadingLogo(true);

    try {
      /*
       * Le fichier peut avoir différentes extensions.
       * On récupère le chemin depuis l’URL enregistrée.
       */
      const url = new URL(logoUrl);
      const marker = '/school-assets/';

      const markerIndex = url.pathname.indexOf(marker);

      if (markerIndex === -1) {
        showToast(
          t('settingsLogoPathError'),
          'error'
        );

        setUploadingLogo(false);
        return;
      }

      const filePath = decodeURIComponent(
        url.pathname.substring(
          markerIndex + marker.length
        )
      );

      const { error: removeError } =
        await supabase.storage
          .from('school-assets')
          .remove([filePath]);

      if (removeError) {
        console.error(
          'Erreur suppression logo:',
          removeError
        );

        showToast(
          `${t('settingsLogoRemoveError')} ${removeError.message}`,
          'error'
        );

        setUploadingLogo(false);
        return;
      }

      const { error: updateError } =
        await supabase
          .from('school_settings')
          .update({
            logo_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq('singleton_key', 'school');

      if (updateError) {
        console.error(
          'Erreur suppression URL logo:',
          updateError
        );

        showToast(
          t('settingsLogoRemoveUrlError'),
          'error'
        );

        setUploadingLogo(false);
        return;
      }

      setLogoUrl(null);

      showToast(
        t('settingsLogoRemoved'),
        'success'
      );
    } catch (error) {
      console.error(
        'Erreur suppression logo:',
        error
      );

      showToast(
        t('settingsLogoRemoveUnexpectedError'),
        'error'
      );
    }

    setUploadingLogo(false);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />

          <p className="text-sm text-slate-500">
            {t('loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {t('settingsTitle')}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {t('settingsDescription')}
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6"
      >
        {/* Identité */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                {t('settingsIdentity')}
              </h2>

              <p className="text-sm text-slate-500">
                {t('settingsIdentityDescription')}
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Input
                label={t('settingsSchoolName')}
                value={form.school_name}
                onChange={(e) =>
                  updateField(
                    'school_name',
                    e.target.value
                  )
                }
                placeholder={t('settingsSchoolNamePlaceholder')}
              />
            </div>

            <Input
              label={t('settingsSchoolNameAr')}
              value={form.school_name_ar}
              onChange={(e) =>
                updateField(
                  'school_name_ar',
                  e.target.value
                )
              }
              dir="rtl"
              placeholder={t('settingsSchoolNameAr')}
            />

            <Input
              label={t('settingsSchoolNameEn')}
              value={form.school_name_en}
              onChange={(e) =>
                updateField(
                  'school_name_en',
                  e.target.value
                )
              }
              placeholder={t('settingsSchoolNameEn')}
            />

            <Select
              label={t('settingsDefaultLanguage')}
              value={form.default_language}
              onChange={(e) =>
                updateField(
                  'default_language',
                  e.target.value as
                    | 'fr'
                    | 'ar'
                    | 'en'
                )
              }
            >
              <option value="fr">
                Français
              </option>

              <option value="ar">
                العربية
              </option>

              <option value="en">
                English
              </option>
            </Select>
          </div>
        </section>

        {/* Logo */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                {t('settingsLogoTitle')}
              </h2>

              <p className="text-sm text-slate-500">
                {t('settingsLogoDescription')}
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Aperçu */}
              <div className="w-36 h-36 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={t('settingsLogoTitle')}
                    className="w-full h-full object-contain p-3"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-xs">
                      {t('settingsNoLogo')}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center sm:items-start gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoChange}
                  className="hidden"
                />

                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogoClick}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('settingsProcessing')}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {logoUrl
                          ? t('settingsChangeLogo')
                          : t('settingsChooseLogo')}
                      </>
                    )}
                  </Button>

                  {logoUrl && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={handleRemoveLogo}
                      disabled={uploadingLogo}
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </Button>
                  )}
                </div>

                <p className="text-xs text-slate-400">
                  {t('settingsLogoFormats')}
                  <br />
                  {t('settingsLogoMaxSize')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Adresse */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                {t('settingsAddressTitle')}
              </h2>

              <p className="text-sm text-slate-500">
                {t('settingsAddressDescription')}
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Input
                label={t('settingsAddress')}
                value={form.address}
                onChange={(e) =>
                  updateField(
                    'address',
                    e.target.value
                  )
                }
                placeholder={t('settingsAddressPlaceholder')}
              />
            </div>

            <Input
              label={t('settingsCity')}
              value={form.city}
              onChange={(e) =>
                updateField('city', e.target.value)
              }
              placeholder={t('settingsCityPlaceholder')}
            />

            <Input
              label={t('settingsWilaya')}
              value={form.wilaya}
              onChange={(e) =>
                updateField(
                  'wilaya',
                  e.target.value
                )
              }
              placeholder={t('settingsCityPlaceholder')}
            />

            <Input
              label={t('settingsCountry')}
              value={form.country}
              onChange={(e) =>
                updateField(
                  'country',
                  e.target.value
                )
              }
              placeholder={form.country || t('settingsCountry')}
            />

            <Input
              label={t('settingsMapsLink')}
              value={form.maps_url}
              onChange={(e) =>
                updateField(
                  'maps_url',
                  e.target.value
                )
              }
              placeholder="https://maps.google.com/..."
            />

            <Input
              label={t('settingsLatitude')}
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) =>
                updateField(
                  'latitude',
                  e.target.value
                )
              }
              placeholder="Ex. 36.7525"
            />

            <Input
              label={t('settingsLongitude')}
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) =>
                updateField(
                  'longitude',
                  e.target.value
                )
              }
              placeholder="Ex. 3.0420"
            />
          </div>
        </section>

        {/* Coordonnées */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                {t('settingsContactTitle')}
              </h2>

              <p className="text-sm text-slate-500">
                {t('settingsContactDescription')}
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label={t('settingsPhone')}
              type="tel"
              value={form.phone}
              onChange={(e) =>
                updateField(
                  'phone',
                  e.target.value
                )
              }
              placeholder="+213 ..."
            />

            <Input
              label={t('email')}
              type="email"
              value={form.email}
              onChange={(e) =>
                updateField(
                  'email',
                  e.target.value
                )
              }
              placeholder="contact@ecole.dz"
            />

            <div className="md:col-span-2">
              <Input
                label={t('settingsWebsite')}
                type="url"
                value={form.website}
                onChange={(e) =>
                  updateField(
                    'website',
                    e.target.value
                  )
                }
                placeholder="https://www.exemple.dz"
              />
            </div>
          </div>
        </section>

        {/* Année scolaire */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                {t('schoolYear')}
              </h2>

              <p className="text-sm text-slate-500">
                {t('settingsSchoolYearDescription')}
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input
              label={t('schoolYear')}
              value={form.school_year}
              onChange={(e) =>
                updateField(
                  'school_year',
                  e.target.value
                )
              }
              placeholder="2026-2027"
            />

            <Input
              label={t('startDate')}
              type="date"
              value={form.start_date}
              onChange={(e) =>
                updateField(
                  'start_date',
                  e.target.value
                )
              }
            />

            <Input
              label={t('endDate')}
              type="date"
              value={form.end_date}
              onChange={(e) =>
                updateField(
                  'end_date',
                  e.target.value
                )
              }
            />
          </div>
        </section>

        {/* Vacances scolaires */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-800">
                  {t('schoolHolidays')}
                </h2>
                <p className="text-sm text-slate-500">
                  {t('schoolHolidaysDescription')}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addHoliday}
            >
              <Plus className="w-4 h-4" />
              {t('addHoliday')}
            </Button>
          </div>

          <div className="p-6 space-y-4">
            {loadingHolidays ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
              </div>
            ) : holidays.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">
                {t('noSchoolHolidays')}
              </div>
            ) : (
              holidays.map((holiday, index) => (
                <div
                  key={holiday.id ?? `new-${index}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="font-medium text-slate-700">
                      {t('holidayPeriod')} {index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() => removeHoliday(index)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title={t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label={t('holidayNameFr')}
                      value={holiday.name_fr}
                      onChange={(e) =>
                        updateHoliday(index, 'name_fr', e.target.value)
                      }
                      placeholder={t('winterBreak')}
                    />

                    <Input
                      label={t('holidayNameAr')}
                      value={holiday.name_ar}
                      onChange={(e) =>
                        updateHoliday(index, 'name_ar', e.target.value)
                      }
                      dir="rtl"
                      placeholder="عطلة الشتاء"
                    />

                    <Input
                      label={t('holidayNameEn')}
                      value={holiday.name_en}
                      onChange={(e) =>
                        updateHoliday(index, 'name_en', e.target.value)
                      }
                      placeholder={t('winterBreak')}
                    />

                    <Input
                      label={t('holidayStartDate')}
                      type="date"
                      value={holiday.start_date}
                      onChange={(e) =>
                        updateHoliday(index, 'start_date', e.target.value)
                      }
                    />

                    <Input
                      label={t('holidayEndDate')}
                      type="date"
                      value={holiday.end_date}
                      onChange={(e) =>
                        updateHoliday(index, 'end_date', e.target.value)
                      }
                    />
                  </div>
                </div>
              ))
            )}

            {holidays.length > 0 && !loadingHolidays && (
              <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                <Button
                  type="button"
                  onClick={saveHolidays}
                  disabled={savingHolidays}
                >
                  {savingHolidays ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {t('saveSchoolHolidays')}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Sauvegarde */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t('settingsSave')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
