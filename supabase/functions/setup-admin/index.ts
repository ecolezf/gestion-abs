import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Client-Info, Apikey',
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse(
      {
        success: false,
        error: 'Method not allowed',
      },
      405
    );
  }

  try {
    console.log('setup-admin: function started');

    // ---------------------------------------------------------
    // 1. Environment
    // ---------------------------------------------------------

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get(
      'SUPABASE_SERVICE_ROLE_KEY'
    );

    if (!supabaseUrl) {
      return jsonResponse(
        {
          success: false,
          step: 'environment',
          error: 'SUPABASE_URL is missing.',
        },
        500
      );
    }

    if (!serviceRoleKey) {
      return jsonResponse(
        {
          success: false,
          step: 'environment',
          error:
            'SUPABASE_SERVICE_ROLE_KEY is missing.',
        },
        500
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // ---------------------------------------------------------
    // 2. Check if a director already exists
    // ---------------------------------------------------------

    const {
      data: existingDirector,
      error: directorCheckError,
    } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'director')
      .limit(1)
      .maybeSingle();

    if (directorCheckError) {
      console.error(
        'setup-admin: director check failed:',
        directorCheckError
      );

      return jsonResponse(
        {
          success: false,
          step: 'director_check',
          error: directorCheckError.message,
          code: directorCheckError.code || null,
        },
        500
      );
    }

    if (existingDirector) {
      return jsonResponse(
        {
          success: false,
          step: 'director_check',
          error:
            'An administrator account already exists. Initial setup is no longer available.',
        },
        409
      );
    }

    // ---------------------------------------------------------
    // 3. Read body
    // ---------------------------------------------------------

    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          step: 'request_body',
          error: 'Invalid JSON request body.',
        },
        400
      );
    }

    const {
      email,
      password,
      first_name_fr,
      last_name_fr,
      first_name_ar,
      last_name_ar,
      first_name_en,
      last_name_en,
    } = body;

    // ---------------------------------------------------------
    // 4. Validate
    // ---------------------------------------------------------

    if (
      typeof email !== 'string' ||
      !email.trim()
    ) {
      return jsonResponse(
        {
          success: false,
          step: 'validation',
          error: 'Email is required.',
        },
        400
      );
    }

    if (
      typeof password !== 'string' ||
      password.length < 8
    ) {
      return jsonResponse(
        {
          success: false,
          step: 'validation',
          error:
            'The password must contain at least 8 characters.',
        },
        400
      );
    }

    if (
      typeof first_name_fr !== 'string' ||
      !first_name_fr.trim()
    ) {
      return jsonResponse(
        {
          success: false,
          step: 'validation',
          error:
            'French first name is required.',
        },
        400
      );
    }

    if (
      typeof last_name_fr !== 'string' ||
      !last_name_fr.trim()
    ) {
      return jsonResponse(
        {
          success: false,
          step: 'validation',
          error:
            'French last name is required.',
        },
        400
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // ---------------------------------------------------------
    // 5. Create Auth user
    // ---------------------------------------------------------

    console.log(
      'setup-admin: creating Auth user'
    );

    const {
      data: newUserData,
      error: createUserError,
    } =
      await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,

        app_metadata: {
          role: 'director',
        },

        user_metadata: {
          role: 'director',

          first_name_fr:
            first_name_fr.trim(),

          last_name_fr:
            last_name_fr.trim(),

          first_name_ar:
            typeof first_name_ar === 'string' &&
            first_name_ar.trim()
              ? first_name_ar.trim()
              : first_name_fr.trim(),

          last_name_ar:
            typeof last_name_ar === 'string' &&
            last_name_ar.trim()
              ? last_name_ar.trim()
              : last_name_fr.trim(),

          first_name_en:
            typeof first_name_en === 'string' &&
            first_name_en.trim()
              ? first_name_en.trim()
              : first_name_fr.trim(),

          last_name_en:
            typeof last_name_en === 'string' &&
            last_name_en.trim()
              ? last_name_en.trim()
              : last_name_fr.trim(),
        },
      });

    if (createUserError || !newUserData?.user) {
      console.error(
        'setup-admin: Auth user creation failed:',
        createUserError
      );

      return jsonResponse(
        {
          success: false,
          step: 'auth_user_creation',
          error:
            createUserError?.message ||
            'Unable to create administrator account.',
        },
        400
      );
    }

    const newUserId =
      newUserData.user.id;

    console.log(
      'setup-admin: Auth user created:',
      newUserId
    );

    // ---------------------------------------------------------
    // 6. Check if profile already exists
    // ---------------------------------------------------------

    const {
      data: existingProfile,
      error: profileCheckError,
    } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', newUserId)
      .maybeSingle();

    if (profileCheckError) {
      console.error(
        'setup-admin: profile check failed:',
        profileCheckError
      );

      return jsonResponse(
        {
          success: false,
          step: 'profile_check',
          error: profileCheckError.message,
          code: profileCheckError.code || null,
        },
        500
      );
    }

    // ---------------------------------------------------------
    // 7. Profile data
    // ---------------------------------------------------------

    const profileData = {
      id: newUserId,
      email: normalizedEmail,

      role: 'director' as const,

      subject: null,

      first_name_fr:
        first_name_fr.trim(),

      last_name_fr:
        last_name_fr.trim(),

      first_name_ar:
        typeof first_name_ar === 'string' &&
        first_name_ar.trim()
          ? first_name_ar.trim()
          : first_name_fr.trim(),

      last_name_ar:
        typeof last_name_ar === 'string' &&
        last_name_ar.trim()
          ? last_name_ar.trim()
          : last_name_fr.trim(),

      first_name_en:
        typeof first_name_en === 'string' &&
        first_name_en.trim()
          ? first_name_en.trim()
          : first_name_fr.trim(),

      last_name_en:
        typeof last_name_en === 'string' &&
        last_name_en.trim()
          ? last_name_en.trim()
          : last_name_fr.trim(),
    };

    // ---------------------------------------------------------
    // 8. Update existing profile OR create it
    // ---------------------------------------------------------

    if (existingProfile) {
      console.log(
        'setup-admin: profile already exists, updating it'
      );

      const {
        error: updateProfileError,
      } = await supabase
        .from('profiles')
        .update({
          email: profileData.email,
          role: profileData.role,
          subject: null,

          first_name_fr:
            profileData.first_name_fr,

          last_name_fr:
            profileData.last_name_fr,

          first_name_ar:
            profileData.first_name_ar,

          last_name_ar:
            profileData.last_name_ar,

          first_name_en:
            profileData.first_name_en,

          last_name_en:
            profileData.last_name_en,
        })
        .eq('id', newUserId);

      if (updateProfileError) {
        console.error(
          'setup-admin: profile update failed:',
          updateProfileError
        );

        return jsonResponse(
          {
            success: false,
            step: 'profile_update',
            error:
              updateProfileError.message,
            code:
              updateProfileError.code || null,
          },
          500
        );
      }
    } else {
      console.log(
        'setup-admin: profile does not exist, creating it'
      );

      const {
        error: insertProfileError,
      } = await supabase
        .from('profiles')
        .insert(profileData);

      if (insertProfileError) {
        console.error(
          'setup-admin: profile creation failed:',
          insertProfileError
        );

        return jsonResponse(
          {
            success: false,
            step: 'profile_creation',
            error:
              insertProfileError.message,
            code:
              insertProfileError.code || null,
          },
          500
        );
      }
    }

    // ---------------------------------------------------------
    // 9. Success
    // ---------------------------------------------------------

    console.log(
      'setup-admin: administrator created successfully'
    );

    return jsonResponse(
      {
        success: true,
        message:
          'Administrator account created successfully.',
        user_id: newUserId,
      },
      200
    );
  } catch (error) {
    console.error(
      'setup-admin: unexpected error:',
      error
    );

    return jsonResponse(
      {
        success: false,
        step: 'unexpected',
        error:
          error instanceof Error
            ? error.message
            : 'Unexpected server error.',
      },
      500
    );
  }
});