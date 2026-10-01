"use client";
import { useIsApp } from "../hooks/useIsApp";
import AppHome from "./AppHome.client";

// Le site web est rendu côté serveur DÈS le premier HTML. Avant, tant que la détection
// « app ou web » n'avait pas tourné (isApp === null), le serveur ne renvoyait qu'un avatar :
// Google, Bing et les robots des moteurs IA (GPTBot, PerplexityBot, ClaudeBot n'exécutent
// pas le JS) voyaient une page d'accueil vide, sans H1 ni FAQ.
// Pour éviter que l'app installée affiche le site une fraction de seconde, un petit script
// applique les mêmes règles que useIsApp avant le rendu et masque le site par CSS.
const PRE_DETECT = `try{var q=new URLSearchParams(location.search).get('pwa')==='1';var s=navigator.standalone===true||matchMedia('(display-mode: standalone)').matches;var r=localStorage.getItem('zeniva_pwa_mode')==='1';var m=innerWidth<768&&(!!localStorage.getItem('zeniva_token')||document.cookie.indexOf('zeniva_token')>-1);if(q||s||r||m)document.documentElement.classList.add('zv-app')}catch(e){}`;

export default function AppHomeGate({ children }: { children: React.ReactNode }) {
  const isApp = useIsApp();

  if (isApp) return <AppHome />;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: "html.zv-app [data-home-web]{display:none}" }} />
      <script dangerouslySetInnerHTML={{ __html: PRE_DETECT }} />
      <div data-home-web="">{children}</div>
    </>
  );
}
