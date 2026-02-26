// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const { action, email, password, userData, userId } = body

    console.log(`[manage-users] Ação recebida: ${action}`, { email, userId });

    if (action === 'create') {
      if (!email || !password) {
        throw new Error("Email e senha são obrigatórios para criação.");
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: userData
      })
      
      if (error) {
        console.error("[manage-users] Erro no Auth Admin:", error.message);
        throw error;
      }

      return new Response(JSON.stringify({ data }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      })
    }

    if (action === 'delete') {
      if (!userId) {
        throw new Error("ID do usuário é obrigatório para exclusão.");
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) {
        console.error("[manage-users] Erro ao deletar no Auth Admin:", error.message);
        throw error;
      }

      return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      })
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    })

  } catch (error) {
    console.error("[manage-users] Erro crítico:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    })
  }
})