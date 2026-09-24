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
  Image as ImageIcon,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { Input, Select } from '@/components/Input';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { useI18n } from '@/i18n/I18nContext';
import type { Language } from '@/types/database';

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

/*
 * Traductions propres à cette page.
 * Elles suivent automatiquement la langue de l'interface.
 */
const pageTranslations = {
  fr: {
    pageTitle: "Configuration de l’établissement",
    pageDescription:
      "Configurez les informations générales de votre établissement.",

    generalInformation: "Informations générales",
    identityDescription: "Nom et identité de l’établissement",

    schoolName: "Nom de l’établissement",
    schoolNamePlaceholder: "Ex. École El Falah",

    nameArabic: "Nom en arabe",
    nameArabicPlaceholder: "اسم المؤسسة",

    nameEnglish: "Nom en anglais",
    nameEnglishPlaceholder: "School name",

    defaultLanguage: "Langue par défaut",
    french: "Français",
    arabic: "العربية",
    english: "English",

    schoolLogo: "Logo de l’établissement",
    logoDescription:
      "Le logo sera utilisé dans l’application et les futurs rapports.",

    noLogo: "Aucun logo",
    processing: "Traitement...",
    changeLogo: "Changer le logo",
    chooseLogo: "Choisir un logo",
    remove: "Supprimer",

    acceptedFormats:
      "Formats acceptés : PNG, JPG, WEBP ou SVG.",
    maximumSize: "Taille maximale : 5 Mo.",

    location: "Adresse et localisation",
    locationDescription:
      "Informations permettant de localiser l’établissement",

    address: "Adresse",
    addressPlaceholder: "Ex. 12 rue des Écoles",

    city: "Ville",
    cityPlaceholder: "Ex. Alger",

    wilaya: "Wilaya",
    wilayaPlaceholder: "Ex. Alger",

    country: "Pays",
    countryPlaceholder: "Algérie",

    googleMaps: "Lien Google Maps",
    googleMapsPlaceholder: "https://maps.google.com/...",

    latitude: "Latitude",
    latitudePlaceholder: "Ex. 36.7525",

    longitude: "Longitude",
    longitudePlaceholder: "Ex. 3.0420",

    contact: "Coordonnées",
    contactDescription:
      "Moyens de contact de l’établissement",

    phone: "Téléphone",
    phonePlaceholder: "+213 ...",

    email: "Email",
    emailPlaceholder: "contact@ecole.dz",

    website: "Site web",
    websitePlaceholder: "https://www.exemple.dz",

    schoolYear: "Année scolaire",
    schoolYearDescription:
      "Période actuelle de l’année scolaire",

    schoolYearLabel: "Année scolaire",
    schoolYearPlaceholder: "2026-2027",

    startDate: "Date de début",
    endDate: "Date de fin",

    saveConfiguration: "Enregistrer la configuration",
    saving: "Enregistrement...",
    loading: "Chargement de la configuration...",

    requiredSchoolName:
      "Le nom de l’établissement est obligatoire.",

    gpsNumeric:
      "Les coordonnées GPS doivent être numériques.",

    loadError:
      "Impossible de charger la configuration.",

    saveError:
      "Impossible d’enregistrer la configuration.",

    saved:
      "Configuration enregistrée avec succès.",

    selectImage:
      "Veuillez sélectionner une image.",

    logoTooLarge:
      "Le logo ne doit pas dépasser 5 Mo.",

    uploadError:
      "Impossible d’envoyer le logo",

    logoUrlError:
      "Le logo a été envoyé, mais son URL n’a pas pu être enregistrée.",

    logoSaved:
      "Logo enregistré avec succès.",

    genericLogoError:
      "Une erreur est survenue lors de l’envoi du logo.",

    cannotDetermineLogo:
      "Impossible de déterminer le fichier du logo.",

    deleteLogoError:
      "Impossible de supprimer le logo",

    deleteLogoUrlError:
      "Le fichier a été supprimé, mais la configuration n’a pas pu être mise à jour.",

    logoDeleted:
      "Logo supprimé avec succès.",

    genericDeleteLogoError:
      "Une erreur est survenue lors de la suppression du logo.",
  },

  ar: {
    pageTitle: "إعدادات المؤسسة",
    pageDescription:
      "قم بتكوين المعلومات العامة الخاصة بمؤسستك.",

    generalInformation: "المعلومات العامة",
    identityDescription: "اسم وهوية المؤسسة",

    schoolName: "اسم المؤسسة",
    schoolNamePlaceholder: "مثال: مدرسة الفلاح",

    nameArabic: "الاسم بالعربية",
    nameArabicPlaceholder: "اسم المؤسسة",

    nameEnglish: "الاسم بالإنجليزية",
    nameEnglishPlaceholder: "School name",

    defaultLanguage: "اللغة الافتراضية",
    french: "Français",
    arabic: "العربية",
    english: "English",

    schoolLogo: "شعار المؤسسة",
    logoDescription:
      "سيتم استخدام الشعار داخل التطبيق وفي التقارير المستقبلية.",

    noLogo: "لا يوجد شعار",
    processing: "جارٍ المعالجة...",
    changeLogo: "تغيير الشعار",
    chooseLogo: "اختيار شعار",
    remove: "حذف",

    acceptedFormats:
      "الصيغ المقبولة: PNG و JPG و WEBP و SVG.",
    maximumSize: "الحد الأقصى للحجم: 5 ميغابايت.",

    location: "العنوان والموقع",
    locationDescription:
      "المعلومات التي تساعد على تحديد موقع المؤسسة",

    address: "العنوان",
    addressPlaceholder: "مثال: 12 شارع المدارس",

    city: "المدينة",
    cityPlaceholder: "مثال: الجزائر",

    wilaya: "الولاية",
    wilayaPlaceholder: "مثال: الجزائر",

    country: "البلد",
    countryPlaceholder: "الجزائر",

    googleMaps: "رابط خرائط Google",
    googleMapsPlaceholder: "https://maps.google.com/...",

    latitude: "خط العرض",
    latitudePlaceholder: "مثال: 36.7525",

    longitude: "خط الطول",
    longitudePlaceholder: "مثال: 3.0420",

    contact: "معلومات الاتصال",
    contactDescription:
      "وسائل الاتصال الخاصة بالمؤسسة",

    phone: "الهاتف",
    phonePlaceholder: "+213 ...",

    email: "البريد الإلكتروني",
    emailPlaceholder: "contact@ecole.dz",

    website: "الموقع الإلكتروني",
    websitePlaceholder: "https://www.exemple.dz",

    schoolYear: "السنة الدراسية",
    schoolYearDescription:
      "الفترة الحالية للسنة الدراسية",

    schoolYearLabel: "السنة الدراسية",
    schoolYearPlaceholder: "2026-2027",

    startDate: "تاريخ البداية",
    endDate: "تاريخ النهاية",

    saveConfiguration: "حفظ الإعدادات",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ تحميل الإعدادات...",

    requiredSchoolName:
      "اسم المؤسسة إلزامي.",

    gpsNumeric:
      "يجب أن تكون إحداثيات GPS أرقامًا.",

    loadError:
      "تعذر تحميل إعدادات المؤسسة.",

    saveError:
      "تعذر حفظ إعدادات المؤسسة.",

    saved:
      "تم حفظ إعدادات المؤسسة بنجاح.",

    selectImage:
      "يرجى اختيار صورة.",

    logoTooLarge:
      "يجب ألا يتجاوز حجم الشعار 5 ميغابايت.",

    uploadError:
      "تعذر رفع الشعار",

    logoUrlError:
      "تم رفع الشعار، ولكن تعذر حفظ رابطه.",

    logoSaved:
      "تم حفظ الشعار بنجاح.",

    genericLogoError:
      "حدث خطأ أثناء رفع الشعار.",

    cannotDetermineLogo:
      "تعذر تحديد ملف الشعار.",

    deleteLogoError:
      "تعذر حذف الشعار",

    deleteLogoUrlError:
      "تم حذف الملف، ولكن تعذر تحديث إعدادات المؤسسة.",

    logoDeleted:
      "تم حذف الشعار بنجاح.",

    genericDeleteLogoError:
      "حدث خطأ أثناء حذف الشعار.",
  },

  en: {
    pageTitle: "School Configuration",
    pageDescription:
      "Configure your school's general information.",

    generalInformation: "General Information",
    identityDescription: "School name and identity",

    schoolName: "School Name",
    schoolNamePlaceholder: "e.g. El Falah School",

    nameArabic: "Name in Arabic",
    nameArabicPlaceholder: "اسم المؤسسة",

    nameEnglish: "Name in English",
    nameEnglishPlaceholder: "School name",

    defaultLanguage: "Default Language",
    french: "Français",
    arabic: "العربية",
    english: "English",

    schoolLogo: "School Logo",
    logoDescription:
      "The logo will be used in the application and future reports.",

    noLogo: "No logo",
    processing: "Processing...",
    changeLogo: "Change Logo",
    chooseLogo: "Choose Logo",
    remove: "Remove",

    acceptedFormats:
      "Accepted formats: PNG, JPG, WEBP or SVG.",
    maximumSize: "Maximum size: 5 MB.",

    location: "Address and Location",
    locationDescription:
      "Information used to locate the school",

    address: "Address",
    addressPlaceholder: "e.g. 12 School Street",

    city: "City",
    cityPlaceholder: "e.g. Algiers",

    wilaya: "Wilaya",
    wilayaPlaceholder: "e.g. Algiers",

    country: "Country",
    countryPlaceholder: "Algeria",

    googleMaps: "Google Maps Link",
    googleMapsPlaceholder: "https://maps.google.com/...",

    latitude: "Latitude",
    latitudePlaceholder: "e.g. 36.7525",

    longitude: "Longitude",
    longitudePlaceholder: "e.g. 3.0420",

    contact: "Contact Information",
    contactDescription:
      "School contact information",

    phone: "Phone",
    phonePlaceholder: "+213 ...",

    email: "Email",
    emailPlaceholder: "contact@school.dz",

    website: "Website",
    websitePlaceholder: "https://www.example.dz",

    schoolYear: "School Year",
    schoolYearDescription:
      "Current school year period",

    schoolYearLabel: "School Year",
    schoolYearPlaceholder: "2026-2027",

    startDate: "Start Date",
    endDate: "End Date",

    saveConfiguration: "Save Configuration",
    saving: "Saving...",
    loading: "Loading configuration...",

    requiredSchoolName:
      "School name is required.",

    gpsNumeric:
      "GPS coordinates must be numeric.",

    loadError:
      "Unable to load the school configuration.",

    saveError:
      "Unable to save the school configuration.",

    saved:
      "Configuration saved successfully.",

    selectImage:
      "Please select an image.",

    logoTooLarge:
      "The logo must not exceed 5 MB.",

    uploadError:
      "Unable to upload the logo",

    logoUrlError:
      "The logo was uploaded, but its URL could not be saved.",

    logoSaved:
      "Logo saved successfully.",

    genericLogoError:
      "An error occurred while uploading the logo.",

    cannotDetermineLogo:
      "Unable to determine the logo file.",

    deleteLogoError:
      "Unable to delete the logo",

    deleteLogoUrlError:
      "The file was deleted, but the configuration could not be updated.",

    logoDeleted:
      "Logo deleted successfully.",

    genericDeleteLogoError:
      "An error occurred while deleting the logo.",
  },
} as const;

export function SettingsPage() {
  const { lang, dir } = useI18n();
  const { showToast } = useToast();

  const labels =
    pageTranslations[lang as Language] || pageTranslations.fr;

  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

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

  const loadSettings = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('school_settings')
      .select('*')
      .eq('singleton_key', 'school')
      .maybeSingle();

    if (error) {
      console.error(
        'Erreur chargement configuration:',
        error
      );

      showToast(
        labels.loadError,
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
        default_language:
          settings.default_language ?? 'fr',
      });

      setLogoUrl(
        settings.logo_url
          ? `${settings.logo_url}?v=${Date.now()}`
          : null
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!form.school_name.trim()) {
      showToast(
        labels.requiredSchoolName,
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
      (latitude !== null &&
        Number.isNaN(latitude)) ||
      (longitude !== null &&
        Number.isNaN(longitude))
    ) {
      showToast(
        labels.gpsNumeric,
        'error'
      );

      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('school_settings')
      .update({
        school_name:
          form.school_name.trim(),

        school_name_ar:
          form.school_name_ar.trim() || null,

        school_name_en:
          form.school_name_en.trim() || null,

        address:
          form.address.trim() || null,

        city:
          form.city.trim() || null,

        wilaya:
          form.wilaya.trim() || null,

        country:
          form.country.trim() || null,

        phone:
          form.phone.trim() || null,

        email:
          form.email.trim() || null,

        website:
          form.website.trim() || null,

        latitude,
        longitude,

        maps_url:
          form.maps_url.trim() || null,

        school_year:
          form.school_year.trim() || null,

        start_date:
          form.start_date || null,

        end_date:
          form.end_date || null,

        default_language:
          form.default_language,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        'singleton_key',
        'school'
      );

    if (error) {
      console.error(
        'Erreur sauvegarde configuration:',
        error
      );

      showToast(
        labels.saveError,
        'error'
      );

      setSaving(false);
      return;
    }

    showToast(
      labels.saved,
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
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast(
        labels.selectImage,
        'error'
      );

      event.target.value = '';
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      showToast(
        labels.logoTooLarge,
        'error'
      );

      event.target.value = '';
      return;
    }

    setUploadingLogo(true);

    try {
      const fileExtension =
        file.name
          .split('.')
          .pop()
          ?.toLowerCase() || 'png';

      const filePath =
        `logo.${fileExtension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from('school-assets')
        .upload(
          filePath,
          file,
          {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type,
          }
        );

      if (uploadError) {
        console.error(
          'Erreur upload logo:',
          uploadError
        );

        showToast(
          `${labels.uploadError} : ${uploadError.message}`,
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
        .getPublicUrl(
          filePath
        );

      const publicUrl =
        publicUrlData.publicUrl;

      const {
        error: updateError,
      } = await supabase
        .from('school_settings')
        .update({
          logo_url: publicUrl,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          'singleton_key',
          'school'
        );

      if (updateError) {
        console.error(
          'Erreur sauvegarde URL logo:',
          updateError
        );

        showToast(
          labels.logoUrlError,
          'error'
        );

        setUploadingLogo(false);
        event.target.value = '';
        return;
      }

      setLogoUrl(
        `${publicUrl}?v=${Date.now()}`
      );

      showToast(
        labels.logoSaved,
        'success'
      );
    } catch (error) {
      console.error(
        'Erreur logo:',
        error
      );

      showToast(
        labels.genericLogoError,
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
      const url =
        new URL(logoUrl);

      const marker =
        '/school-assets/';

      const markerIndex =
        url.pathname.indexOf(
          marker
        );

      if (markerIndex === -1) {
        showToast(
          labels.cannotDetermineLogo,
          'error'
        );

        setUploadingLogo(false);
        return;
      }

      const filePath =
        decodeURIComponent(
          url.pathname.substring(
            markerIndex +
              marker.length
          )
        );

      const {
        error: removeError,
      } = await supabase.storage
        .from('school-assets')
        .remove([filePath]);

      if (removeError) {
        console.error(
          'Erreur suppression logo:',
          removeError
        );

        showToast(
          `${labels.deleteLogoError} : ${removeError.message}`,
          'error'
        );

        setUploadingLogo(false);
        return;
      }

      const {
        error: updateError,
      } = await supabase
        .from('school_settings')
        .update({
          logo_url: null,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          'singleton_key',
          'school'
        );

      if (updateError) {
        console.error(
          'Erreur suppression URL logo:',
          updateError
        );

        showToast(
          labels.deleteLogoUrlError,
          'error'
        );

        setUploadingLogo(false);
        return;
      }

      setLogoUrl(null);

      showToast(
        labels.logoDeleted,
        'success'
      );
    } catch (error) {
      console.error(
        'Erreur suppression logo:',
        error
      );

      showToast(
        labels.genericDeleteLogoError,
        'error'
      );
    }

    setUploadingLogo(false);
  };

  if (loading) {
    return (
      <div
        className="min-h-[400px] flex items-center justify-center"
        dir={dir}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />

          <p className="text-sm text-slate-500">
            {labels.loading}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-5xl mx-auto space-y-6"
      dir={dir}
    >
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {labels.pageTitle}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {labels.pageDescription}
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6"
      >
        {/* Informations générales */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                {labels.generalInformation}
              </h2>

              <p className="text-sm text-slate-500">
                {labels.identityDescription}
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Input
                label={`${labels.schoolName} *`}
                value={form.school_name}
                onChange={(e) =>
                  updateField(
                    'school_name',
                    e.target.value
                  )
                }
                placeholder={
                  labels.schoolNamePlaceholder
                }
              />
            </div>

            <Input
              label={labels.nameArabic}
              value={form.school_name_ar}
              onChange={(e) =>
                updateField(
                  'school_name_ar',
                  e.target.value
                )
              }
              dir="rtl"
              placeholder={
                labels.nameArabicPlaceholder
              }
            />

            <Input
              label={labels.nameEnglish}
              value={form.school_name_en}
              onChange={(e) =>
                updateField(
                  'school_name_en',
                  e.target.value
                )
              }
              placeholder={
                labels.nameEnglishPlaceholder
              }
            />

            <Select
              label={labels.defaultLanguage}
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
                {labels.french}
              </option>

              <option value="ar">
                {labels.arabic}
              </option>

              <option value="en">
                {labels.english}
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
                {labels.schoolLogo}
              </h2>

              <p className="text-sm text-slate-500">
                {labels.logoDescription}
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Aperçu du logo */}
              <div className="w-36 h-36 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={labels.schoolLogo}
                    className="w-full h-full object-contain p-3"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ImageIcon className="w-10 h-10" />

                    <span className="text-xs">
                      {labels.noLogo}
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
                        {labels.processing}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />

                        {logoUrl
                          ? labels.changeLogo
                          : labels.chooseLogo}
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
                      {labels.remove}
                    </Button>
                  )}
                </div>

                <p className="text-xs text-slate-400">
                  {labels.acceptedFormats}
                  <br />
                  {labels.maximumSize}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Adresse et localisation */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                {labels.location}
              </h2>

              <p className="text-sm text-slate-500">
                {labels.locationDescription}
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Input
                label={labels.address}
                value={form.address}
                onChange={(e) =>
                  updateField(
                    'address',
                    e.target.value
                  )
                }
                placeholder={
                  labels.addressPlaceholder
                }
              />
            </div>

            <Input
              label={labels.city}
              value={form.city}
              onChange={(e) =>
                updateField(
                  'city',
                  e.target.value
                )
              }
              placeholder={
                labels.cityPlaceholder
              }
            />

            <Input
              label={labels.wilaya}
              value={form.wilaya}
              onChange={(e) =>
                updateField(
                  'wilaya',
                  e.target.value
                )
              }
              placeholder={
                labels.wilayaPlaceholder
              }
            />

            <Input
              label={labels.country}
              value={form.country}
              onChange={(e) =>
                updateField(
                  'country',
                  e.target.value
                )
              }
              placeholder={
                labels.countryPlaceholder
              }
            />

            <Input
              label={labels.googleMaps}
              value={form.maps_url}
              onChange={(e) =>
                updateField(
                  'maps_url',
                  e.target.value
                )
              }
              placeholder={
                labels.googleMapsPlaceholder
              }
              dir="ltr"
            />

            <Input
              label={labels.latitude}
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) =>
                updateField(
                  'latitude',
                  e.target.value
                )
              }
              placeholder={
                labels.latitudePlaceholder
              }
              dir="ltr"
            />

            <Input
              label={labels.longitude}
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) =>
                updateField(
                  'longitude',
                  e.target.value
                )
              }
              placeholder={
                labels.longitudePlaceholder
              }
              dir="ltr"
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
                {labels.contact}
              </h2>

              <p className="text-sm text-slate-500">
                {labels.contactDescription}
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label={labels.phone}
              type="tel"
              value={form.phone}
              onChange={(e) =>
                updateField(
                  'phone',
                  e.target.value
                )
              }
              placeholder={
                labels.phonePlaceholder
              }
              dir="ltr"
            />

            <Input
              label={labels.email}
              type="email"
              value={form.email}
              onChange={(e) =>
                updateField(
                  'email',
                  e.target.value
                )
              }
              placeholder={
                labels.emailPlaceholder
              }
              dir="ltr"
            />

            <div className="md:col-span-2">
              <Input
                label={labels.website}
                type="url"
                value={form.website}
                onChange={(e) =>
                  updateField(
                    'website',
                    e.target.value
                  )
                }
                placeholder={
                  labels.websitePlaceholder
                }
                dir="ltr"
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
                {labels.schoolYear}
              </h2>

              <p className="text-sm text-slate-500">
                {labels.schoolYearDescription}
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input
              label={labels.schoolYearLabel}
              value={form.school_year}
              onChange={(e) =>
                updateField(
                  'school_year',
                  e.target.value
                )
              }
              placeholder={
                labels.schoolYearPlaceholder
              }
              dir="ltr"
            />

            <Input
              label={labels.startDate}
              type="date"
              value={form.start_date}
              onChange={(e) =>
                updateField(
                  'start_date',
                  e.target.value
                )
              }
              dir="ltr"
            />

            <Input
              label={labels.endDate}
              type="date"
              value={form.end_date}
              onChange={(e) =>
                updateField(
                  'end_date',
                  e.target.value
                )
              }
              dir="ltr"
            />
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
                {labels.saving}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {labels.saveConfiguration}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}