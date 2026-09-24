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

export function SettingsPage() {
  const { showToast } = useToast();

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
      console.error('Erreur chargement configuration:', error);
      showToast(
        'Impossible de charger la configuration.',
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

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.school_name.trim()) {
      showToast(
        'Le nom de l’établissement est obligatoire.',
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
        'Les coordonnées GPS doivent être numériques.',
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
        'Impossible d’enregistrer la configuration.',
        'error'
      );

      setSaving(false);
      return;
    }

    showToast(
      'Configuration enregistrée avec succès.',
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
        'Veuillez sélectionner une image.',
        'error'
      );

      event.target.value = '';
      return;
    }

    // Limite de taille : 5 Mo
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      showToast(
        'Le logo ne doit pas dépasser 5 Mo.',
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
          `Impossible d’envoyer le logo : ${uploadError.message}`,
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
          'Le logo a été envoyé, mais son URL n’a pas pu être enregistrée.',
          'error'
        );

        setUploadingLogo(false);
        event.target.value = '';
        return;
      }

      setLogoUrl(`${publicUrl}?v=${Date.now()}`);

      showToast(
        'Logo enregistré avec succès.',
        'success'
      );
    } catch (error) {
      console.error('Erreur logo:', error);

      showToast(
        'Une erreur est survenue lors de l’envoi du logo.',
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
          'Impossible de déterminer le fichier du logo.',
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
          `Impossible de supprimer le logo : ${removeError.message}`,
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
          'Le fichier a été supprimé, mais la configuration n’a pas pu être mise à jour.',
          'error'
        );

        setUploadingLogo(false);
        return;
      }

      setLogoUrl(null);

      showToast(
        'Logo supprimé avec succès.',
        'success'
      );
    } catch (error) {
      console.error(
        'Erreur suppression logo:',
        error
      );

      showToast(
        'Une erreur est survenue lors de la suppression du logo.',
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
            Chargement de la configuration...
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
          Configuration de l’établissement
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Configurez les informations générales de votre établissement.
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
                Informations générales
              </h2>

              <p className="text-sm text-slate-500">
                Nom et identité de l’établissement
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Input
                label="Nom de l’établissement *"
                value={form.school_name}
                onChange={(e) =>
                  updateField(
                    'school_name',
                    e.target.value
                  )
                }
                placeholder="Ex. École El Falah"
              />
            </div>

            <Input
              label="Nom en arabe"
              value={form.school_name_ar}
              onChange={(e) =>
                updateField(
                  'school_name_ar',
                  e.target.value
                )
              }
              dir="rtl"
              placeholder="اسم المؤسسة"
            />

            <Input
              label="Nom en anglais"
              value={form.school_name_en}
              onChange={(e) =>
                updateField(
                  'school_name_en',
                  e.target.value
                )
              }
              placeholder="School name"
            />

            <Select
              label="Langue par défaut"
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
                Logo de l’établissement
              </h2>

              <p className="text-sm text-slate-500">
                Le logo sera utilisé dans l’application et les futurs rapports.
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Aperçu */}
              <div className="w-36 h-36 rounded-2xl border-2 border-red-500 bg-white flex items-center justify-center shrink-0">
              {logoUrl ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                           <img
  src={logoUrl}
  alt="Logo de l’établissement"
  style={{
    width: '120px',
    height: '120px',
    objectFit: 'contain',
    display: 'block',
  }}
/>

                            <p className="text-[10px] text-slate-400 break-all px-2 text-center">
                            {logoUrl}
                            </p>
                        </div>
                        ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-xs">
                      Aucun logo
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
                        Traitement...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {logoUrl
                          ? 'Changer le logo'
                          : 'Choisir un logo'}
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
                  Formats acceptés : PNG, JPG, WEBP ou SVG.
                  <br />
                  Taille maximale : 5 Mo.
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
                Adresse et localisation
              </h2>

              <p className="text-sm text-slate-500">
                Informations permettant de localiser l’établissement
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Input
                label="Adresse"
                value={form.address}
                onChange={(e) =>
                  updateField(
                    'address',
                    e.target.value
                  )
                }
                placeholder="Ex. 12 rue des Écoles"
              />
            </div>

            <Input
              label="Ville"
              value={form.city}
              onChange={(e) =>
                updateField('city', e.target.value)
              }
              placeholder="Ex. Alger"
            />

            <Input
              label="Wilaya"
              value={form.wilaya}
              onChange={(e) =>
                updateField(
                  'wilaya',
                  e.target.value
                )
              }
              placeholder="Ex. Alger"
            />

            <Input
              label="Pays"
              value={form.country}
              onChange={(e) =>
                updateField(
                  'country',
                  e.target.value
                )
              }
              placeholder="Algérie"
            />

            <Input
              label="Lien Google Maps"
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
              label="Latitude"
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
              label="Longitude"
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
                Coordonnées
              </h2>

              <p className="text-sm text-slate-500">
                Moyens de contact de l’établissement
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Téléphone"
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
              label="Email"
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
                label="Site web"
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
                Année scolaire
              </h2>

              <p className="text-sm text-slate-500">
                Période actuelle de l’année scolaire
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input
              label="Année scolaire"
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
              label="Date de début"
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
              label="Date de fin"
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
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer la configuration
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}