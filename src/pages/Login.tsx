"use client";

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';

export const Login = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-center mb-8">
          <img src="/logo.webp" alt="WNFitas Logo" className="h-16 w-auto object-contain" />
        </div>
        
        <h2 className="text-xl font-semibold text-slate-100 mb-6 text-center">Acesse o Sistema Industrial</h2>
        
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                  inputBackground: '#020617',
                  inputText: '#f8fafc',
                  inputBorder: '#1e293b',
                  inputPlaceholder: '#64748b',
                }
              }
            }
          }}
          theme="dark"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Endereço de e-mail',
                password_label: 'Senha',
                email_input_placeholder: 'Seu endereço de e-mail',
                password_input_placeholder: 'Sua senha',
                button_label: 'Entrar',
                loading_button_label: 'Entrando...',
                social_provider_text: 'Entrar com {{provider}}',
                link_text: 'Já tem uma conta? Entre',
              },
              sign_up: {
                email_label: 'Endereço de e-mail',
                password_label: 'Senha',
                email_input_placeholder: 'Seu endereço de e-mail',
                password_input_placeholder: 'Sua senha',
                button_label: 'Cadastrar',
                loading_button_label: 'Cadastrando...',
                link_text: 'Não tem uma conta? Cadastre-se',
              },
              forgotten_password: {
                email_label: 'Endereço de e-mail',
                password_label: 'Senha',
                email_input_placeholder: 'Seu endereço de e-mail',
                button_label: 'Enviar instruções de recuperação',
                loading_button_label: 'Enviando...',
                link_text: 'Esqueceu sua senha?',
              }
            }
          }}
        />
      </div>
    </div>
  );
};