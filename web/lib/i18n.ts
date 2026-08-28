// UI internationalization. User-generated checklist content is translated by
// AI (lib/translate.ts); everything else — chrome, buttons, emails — comes
// from these dictionaries. Adding a language = adding a column here plus an
// entry in LANGUAGES (and the AI translator picks it up automatically).

export type Lang = "en" | "it";

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "it", label: "Italiano" },
];

export const DEFAULT_LANG: Lang = "en";

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "it";
}

export function langName(code: Lang): string {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code;
}

const messages = {
  // Common chrome
  app_name: { en: "MonthlyAlerts", it: "MonthlyAlerts" },
  nav_projects: { en: "Projects", it: "Progetti" },
  nav_settings: { en: "Settings", it: "Impostazioni" },
  log_out: { en: "Log out", it: "Esci" },
  log_in: { en: "Log in", it: "Accedi" },
  save: { en: "Save", it: "Salva" },
  cancel: { en: "Cancel", it: "Annulla" },
  delete: { en: "Delete", it: "Elimina" },
  edit: { en: "Edit", it: "Modifica" },
  add: { en: "Add", it: "Aggiungi" },
  back: { en: "Back", it: "Indietro" },
  optional: { en: "optional", it: "facoltativo" },
  error_generic: {
    en: "Something went wrong. Please try again.",
    it: "Si è verificato un errore. Riprova.",
  },

  // Landing
  landing_tagline: {
    en: "Construction checklists your whole crew can read",
    it: "Liste di controllo per il cantiere che tutta la squadra può leggere",
  },
  landing_sub: {
    en: "Set up a project punch list once. Everyone on the job — owner, subs, inspectors — works the same list in their own language, translated automatically.",
    it: "Crea la lista di progetto una sola volta. Tutti in cantiere — titolare, subappaltatori, ispettori — lavorano sulla stessa lista nella propria lingua, tradotta automaticamente.",
  },
  landing_cta: { en: "Start a project", it: "Avvia un progetto" },
  landing_feature_1_title: { en: "One list, every language", it: "Una lista, ogni lingua" },
  landing_feature_1_body: {
    en: "Items, comments, and updates are translated automatically for each member's preferred language.",
    it: "Voci, commenti e aggiornamenti vengono tradotti automaticamente nella lingua preferita di ogni membro.",
  },
  landing_feature_2_title: { en: "Built for the job site", it: "Pensato per il cantiere" },
  landing_feature_2_body: {
    en: "Phases, photo documentation, assignees, and due dates — organized the way construction work actually runs.",
    it: "Fasi, documentazione fotografica, assegnatari e scadenze — organizzati come funziona davvero il lavoro in cantiere.",
  },
  landing_feature_3_title: { en: "Everyone stays current", it: "Tutti restano aggiornati" },
  landing_feature_3_body: {
    en: "A monthly status email keeps every member up to date on progress, new work, and overdue items.",
    it: "Un'email mensile di stato aggiorna ogni membro su avanzamento, nuovi lavori e voci in ritardo.",
  },

  // Login
  login_title: { en: "Log in or sign up", it: "Accedi o registrati" },
  login_sub: {
    en: "Enter your email and we'll send you a secure sign-in link. No password needed.",
    it: "Inserisci la tua email e ti invieremo un link di accesso sicuro. Nessuna password necessaria.",
  },
  login_email_label: { en: "Email address", it: "Indirizzo email" },
  login_submit: { en: "Send sign-in link", it: "Invia link di accesso" },
  login_sent_title: { en: "Check your email", it: "Controlla la tua email" },
  login_sent_body: {
    en: "We sent a sign-in link to {email}. It expires in 30 minutes.",
    it: "Abbiamo inviato un link di accesso a {email}. Scade tra 30 minuti.",
  },
  login_invalid_link: {
    en: "That sign-in link is invalid or has expired. Request a new one below.",
    it: "Il link di accesso non è valido o è scaduto. Richiedine uno nuovo qui sotto.",
  },

  // Onboarding
  welcome_title: { en: "Welcome — tell us about you", it: "Benvenuto — parlaci di te" },
  welcome_sub: {
    en: "This is shown to your project teams and sets the language you'll see everything in.",
    it: "Queste informazioni sono visibili ai team di progetto e definiscono la lingua in cui vedrai tutto.",
  },
  field_name: { en: "Full name", it: "Nome e cognome" },
  field_company: { en: "Company", it: "Azienda" },
  field_phone: { en: "Phone", it: "Telefono" },
  field_language: { en: "Preferred language", it: "Lingua preferita" },
  welcome_submit: { en: "Continue", it: "Continua" },

  // Dashboard
  dashboard_title: { en: "Projects", it: "Progetti" },
  dashboard_empty_title: { en: "No projects yet", it: "Nessun progetto" },
  dashboard_empty_body: {
    en: "Create your first project checklist, or ask a project owner to invite you.",
    it: "Crea la tua prima lista di progetto, oppure chiedi a un titolare di progetto di invitarti.",
  },
  new_project: { en: "New project", it: "Nuovo progetto" },
  role_owner: { en: "Owner", it: "Titolare" },
  role_editor: { en: "Editor", it: "Editore" },
  role_commenter: { en: "Commenter", it: "Commentatore" },
  progress_done: { en: "{done} of {total} complete", it: "{done} di {total} completate" },
  archived: { en: "Archived", it: "Archiviato" },

  // New project
  new_project_title: { en: "New project", it: "Nuovo progetto" },
  new_project_sub: {
    en: "Name the job and add the site details. You'll add checklist sections next.",
    it: "Dai un nome al lavoro e aggiungi i dettagli del cantiere. Aggiungerai le sezioni della lista subito dopo.",
  },
  field_project_name: { en: "Project name", it: "Nome del progetto" },
  field_address: { en: "Site address", it: "Indirizzo del cantiere" },
  field_description: { en: "Description", it: "Descrizione" },
  create_project: { en: "Create project", it: "Crea progetto" },

  // Project page
  add_section: { en: "Add section", it: "Aggiungi sezione" },
  section_name_placeholder: {
    en: "Section name — e.g. Foundation, Framing, Electrical",
    it: "Nome sezione — es. Fondazioni, Struttura, Impianto elettrico",
  },
  add_item: { en: "Add item", it: "Aggiungi voce" },
  item_title_placeholder: { en: "What needs to be done?", it: "Cosa deve essere fatto?" },
  no_sections_yet: {
    en: "Start by adding a section — a phase of the job like Foundation, Framing, or Finishes.",
    it: "Inizia aggiungendo una sezione — una fase del lavoro come Fondazioni, Struttura o Finiture.",
  },
  no_items_yet: { en: "No items in this section yet.", it: "Nessuna voce in questa sezione." },
  status_open: { en: "Open", it: "Aperto" },
  status_in_progress: { en: "In progress", it: "In corso" },
  status_done: { en: "Done", it: "Completato" },
  due: { en: "Due {date}", it: "Scadenza {date}" },
  overdue: { en: "Overdue", it: "In ritardo" },
  members: { en: "Members", it: "Membri" },
  project_settings: { en: "Project settings", it: "Impostazioni progetto" },
  translated_note: {
    en: "Translated automatically — original in {lang}",
    it: "Tradotto automaticamente — originale in {lang}",
  },

  // Item detail
  item_details: { en: "Details", it: "Dettagli" },
  field_status: { en: "Status", it: "Stato" },
  field_assignee: { en: "Assigned to", it: "Assegnato a" },
  field_due_date: { en: "Due date", it: "Data di scadenza" },
  unassigned: { en: "Unassigned", it: "Non assegnato" },
  photos: { en: "Photos", it: "Foto" },
  add_photo: { en: "Add photo", it: "Aggiungi foto" },
  comments: { en: "Comments", it: "Commenti" },
  comment_placeholder: { en: "Write a comment…", it: "Scrivi un commento…" },
  post_comment: { en: "Post", it: "Invia" },
  no_comments: { en: "No comments yet.", it: "Nessun commento." },
  delete_item_confirm: {
    en: "Delete this item and its photos and comments?",
    it: "Eliminare questa voce con le sue foto e i suoi commenti?",
  },
  added_by: { en: "Added by {name}", it: "Aggiunto da {name}" },

  // Project settings / members
  settings_project_title: { en: "Project settings", it: "Impostazioni progetto" },
  invite_member: { en: "Invite member", it: "Invita membro" },
  invite_role_label: { en: "Role", it: "Ruolo" },
  invite_send: { en: "Send invitation", it: "Invia invito" },
  invite_pending: { en: "Pending invitations", it: "Inviti in sospeso" },
  invite_expires: { en: "Expires {date}", it: "Scade {date}" },
  invite_revoke: { en: "Revoke", it: "Revoca" },
  member_remove: { en: "Remove", it: "Rimuovi" },
  role_editor_desc: {
    en: "Can add and edit items, check work off, and upload photos",
    it: "Può aggiungere e modificare voci, spuntare lavori e caricare foto",
  },
  role_commenter_desc: {
    en: "Can view the checklist and add comments",
    it: "Può vedere la lista e aggiungere commenti",
  },
  archive_project: { en: "Archive project", it: "Archivia progetto" },
  unarchive_project: { en: "Unarchive project", it: "Ripristina progetto" },
  archive_hint: {
    en: "Archived projects are read-only and stop sending monthly updates.",
    it: "I progetti archiviati sono in sola lettura e non inviano più aggiornamenti mensili.",
  },
  delete_project: { en: "Delete project", it: "Elimina progetto" },
  delete_project_confirm: {
    en: "Permanently delete this project, its checklist, photos, and members? This cannot be undone.",
    it: "Eliminare definitivamente questo progetto con lista, foto e membri? L'operazione non può essere annullata.",
  },

  // Invite acceptance
  invite_title: { en: "You're invited", it: "Sei stato invitato" },
  invite_body: {
    en: "{inviter} invited you to join the project \"{project}\" on MonthlyAlerts as {role}.",
    it: "{inviter} ti ha invitato a unirti al progetto \"{project}\" su MonthlyAlerts come {role}.",
  },
  invite_accept: { en: "Accept invitation", it: "Accetta invito" },
  invite_invalid: {
    en: "This invitation is invalid, expired, or was already used.",
    it: "Questo invito non è valido, è scaduto o è già stato utilizzato.",
  },
  invite_wrong_account: {
    en: "This invitation was sent to {email}, but you're logged in as {current}. Log out and use the invited address.",
    it: "Questo invito è stato inviato a {email}, ma hai effettuato l'accesso come {current}. Esci e usa l'indirizzo invitato.",
  },

  // User settings
  settings_title: { en: "Settings", it: "Impostazioni" },
  settings_profile: { en: "Profile", it: "Profilo" },
  settings_email_prefs: { en: "Email preferences", it: "Preferenze email" },
  settings_monthly_email: {
    en: "Send me the monthly project status email",
    it: "Inviami l'email mensile sullo stato dei progetti",
  },
  saved: { en: "Saved", it: "Salvato" },

  // Unsubscribe
  unsubscribe_done_title: { en: "You're unsubscribed", it: "Iscrizione annullata" },
  unsubscribe_done_body: {
    en: "You'll no longer receive monthly status emails. You can turn them back on any time in Settings.",
    it: "Non riceverai più le email mensili di stato. Puoi riattivarle in qualsiasi momento nelle Impostazioni.",
  },

  // Emails
  email_magic_subject: { en: "Your MonthlyAlerts sign-in link", it: "Il tuo link di accesso a MonthlyAlerts" },
  email_magic_title: { en: "Sign in to MonthlyAlerts", it: "Accedi a MonthlyAlerts" },
  email_magic_body: {
    en: "Click the button below to sign in. This link expires in 30 minutes and can be used once.",
    it: "Fai clic sul pulsante qui sotto per accedere. Questo link scade tra 30 minuti e può essere usato una sola volta.",
  },
  email_magic_button: { en: "Sign in", it: "Accedi" },
  email_magic_ignore: {
    en: "If you didn't request this, you can safely ignore this email.",
    it: "Se non hai richiesto tu questo accesso, puoi ignorare questa email.",
  },
  email_invite_subject: {
    en: "{inviter} invited you to \"{project}\" on MonthlyAlerts",
    it: "{inviter} ti ha invitato a \"{project}\" su MonthlyAlerts",
  },
  email_invite_button: { en: "View invitation", it: "Vedi invito" },
  email_invite_expiry: { en: "This invitation expires in 14 days.", it: "Questo invito scade tra 14 giorni." },
  email_monthly_subject: {
    en: "{project} — {month} status update",
    it: "{project} — aggiornamento di {month}",
  },
  email_monthly_title: { en: "{month} status", it: "Stato di {month}" },
  email_monthly_progress: { en: "Overall progress", it: "Avanzamento complessivo" },
  email_monthly_completed: { en: "Completed this month", it: "Completate questo mese" },
  email_monthly_added: { en: "Added this month", it: "Aggiunte questo mese" },
  email_monthly_overdue: { en: "Overdue", it: "In ritardo" },
  email_monthly_overdue_list: { en: "Overdue items", it: "Voci in ritardo" },
  email_monthly_open_project: { en: "Open project", it: "Apri progetto" },
  email_monthly_unsubscribe: {
    en: "Stop receiving these monthly updates",
    it: "Smetti di ricevere questi aggiornamenti mensili",
  },
  email_footer: {
    en: "MonthlyAlerts.com — multilingual construction checklists.",
    it: "MonthlyAlerts.com — liste di controllo multilingue per l'edilizia.",
  },

  // Billing
  billing_required_title: { en: "Activate this project", it: "Attiva questo progetto" },
  billing_required_body: {
    en: "New projects require a one-time project fee. You'll be taken to secure checkout.",
    it: "I nuovi progetti richiedono una tariffa una tantum. Verrai reindirizzato al pagamento sicuro.",
  },
  billing_checkout: { en: "Continue to checkout", it: "Procedi al pagamento" },
  billing_success_title: { en: "Project activated", it: "Progetto attivato" },
  billing_success_body: {
    en: "Payment received — your project is ready.",
    it: "Pagamento ricevuto — il tuo progetto è pronto.",
  },
} as const;

export type MessageKey = keyof typeof messages;

export function t(
  lang: Lang,
  key: MessageKey,
  params?: Record<string, string | number>
): string {
  let text: string = messages[key][lang] ?? messages[key][DEFAULT_LANG];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}
