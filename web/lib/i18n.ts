// UI internationalization. User-generated checklist content is translated by
// AI (lib/translate.ts); everything else — chrome, buttons, emails — comes
// from these dictionaries. Adding a language = adding a column here plus an
// entry in LANGUAGES (and the AI translator picks it up automatically).

export type Lang = "en" | "it" | "es";

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "it", label: "Italiano" },
  { code: "es", label: "Español" },
];

export const DEFAULT_LANG: Lang = "en";

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "it" || value === "es";
}

export function langName(code: Lang): string {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code;
}

/** BCP-47 locale for date/number formatting. */
export function locale(lang: Lang): string {
  return { en: "en-US", it: "it-IT", es: "es-ES" }[lang];
}

const messages = {
  // Common chrome
  app_name: { en: "MonthlyAlerts", it: "MonthlyAlerts", es: "MonthlyAlerts" },
  nav_projects: { en: "Projects", it: "Progetti", es: "Proyectos" },
  nav_settings: { en: "Settings", it: "Impostazioni", es: "Configuración" },
  log_out: { en: "Log out", it: "Esci", es: "Cerrar sesión" },
  log_in: { en: "Log in", it: "Accedi", es: "Iniciar sesión" },
  save: { en: "Save", it: "Salva", es: "Guardar" },
  cancel: { en: "Cancel", it: "Annulla", es: "Cancelar" },
  delete: { en: "Delete", it: "Elimina", es: "Eliminar" },
  edit: { en: "Edit", it: "Modifica", es: "Editar" },
  add: { en: "Add", it: "Aggiungi", es: "Añadir" },
  back: { en: "Back", it: "Indietro", es: "Atrás" },
  optional: { en: "optional", it: "facoltativo", es: "opcional" },
  print: { en: "Print", it: "Stampa", es: "Imprimir" },
  error_generic: {
    en: "Something went wrong. Please try again.",
    it: "Si è verificato un errore. Riprova.",
    es: "Algo salió mal. Inténtalo de nuevo.",
  },

  // Landing
  landing_tagline: {
    en: "Construction checklists your whole crew can read",
    it: "Liste di controllo per il cantiere che tutta la squadra può leggere",
    es: "Listas de control de obra que toda tu cuadrilla puede leer",
  },
  landing_sub: {
    en: "Set up a project punch list once. Everyone on the job — owner, subs, inspectors — works the same list in their own language, translated automatically.",
    it: "Crea la lista di progetto una sola volta. Tutti in cantiere — titolare, subappaltatori, ispettori — lavorano sulla stessa lista nella propria lingua, tradotta automaticamente.",
    es: "Crea la lista del proyecto una sola vez. Todos en la obra — propietario, subcontratistas, inspectores — trabajan con la misma lista en su propio idioma, traducida automáticamente.",
  },
  landing_cta: { en: "Start a project", it: "Avvia un progetto", es: "Iniciar un proyecto" },
  landing_feature_1_title: {
    en: "One list, every language",
    it: "Una lista, ogni lingua",
    es: "Una lista, todos los idiomas",
  },
  landing_feature_1_body: {
    en: "Items, comments, and updates are translated automatically for each member's preferred language.",
    it: "Voci, commenti e aggiornamenti vengono tradotti automaticamente nella lingua preferita di ogni membro.",
    es: "Las tareas, comentarios y novedades se traducen automáticamente al idioma preferido de cada miembro.",
  },
  landing_feature_2_title: {
    en: "Built for the job site",
    it: "Pensato per il cantiere",
    es: "Hecho para la obra",
  },
  landing_feature_2_body: {
    en: "Phases, photo documentation, assignees, and due dates — organized the way construction work actually runs.",
    it: "Fasi, documentazione fotografica, assegnatari e scadenze — organizzati come funziona davvero il lavoro in cantiere.",
    es: "Fases, documentación fotográfica, responsables y fechas límite — organizados como realmente funciona el trabajo de construcción.",
  },
  landing_feature_3_title: {
    en: "Everyone stays current",
    it: "Tutti restano aggiornati",
    es: "Todos se mantienen al día",
  },
  landing_feature_3_body: {
    en: "A monthly status email keeps every member up to date on progress, new work, and overdue items.",
    it: "Un'email mensile di stato aggiorna ogni membro su avanzamento, nuovi lavori e voci in ritardo.",
    es: "Un correo mensual de estado mantiene a cada miembro al día sobre el avance, trabajos nuevos y tareas atrasadas.",
  },

  // Login / signup
  login_title: { en: "Log in", it: "Accedi", es: "Iniciar sesión" },
  signup_title: { en: "Create your account", it: "Crea il tuo account", es: "Crea tu cuenta" },
  login_sub: {
    en: "Welcome back — enter your email and password.",
    it: "Bentornato — inserisci email e password.",
    es: "Bienvenido de nuevo — escribe tu correo y contraseña.",
  },
  signup_sub: {
    en: "Sign up with your email and a password. We'll send you a confirmation link before you can log in.",
    it: "Registrati con email e password. Ti invieremo un link di conferma prima che tu possa accedere.",
    es: "Regístrate con tu correo y una contraseña. Te enviaremos un enlace de confirmación antes de poder iniciar sesión.",
  },
  login_email_label: { en: "Email address", it: "Indirizzo email", es: "Correo electrónico" },
  password_label: { en: "Password", it: "Password", es: "Contraseña" },
  password_hint: {
    en: "At least 8 characters",
    it: "Almeno 8 caratteri",
    es: "Al menos 8 caracteres",
  },
  login_submit: { en: "Log in", it: "Accedi", es: "Iniciar sesión" },
  signup_submit: { en: "Create account", it: "Crea account", es: "Crear cuenta" },
  login_no_account: {
    en: "New to MonthlyAlerts?",
    it: "Nuovo su MonthlyAlerts?",
    es: "¿Nuevo en MonthlyAlerts?",
  },
  signup_have_account: {
    en: "Already have an account?",
    it: "Hai già un account?",
    es: "¿Ya tienes una cuenta?",
  },
  forgot_password: { en: "Forgot password?", it: "Password dimenticata?", es: "¿Olvidaste tu contraseña?" },
  forgot_title: { en: "Reset your password", it: "Reimposta la password", es: "Restablece tu contraseña" },
  forgot_sub: {
    en: "Enter your email and we'll send you a link to set a new password.",
    it: "Inserisci la tua email e ti invieremo un link per impostare una nuova password.",
    es: "Escribe tu correo y te enviaremos un enlace para establecer una nueva contraseña.",
  },
  forgot_submit: { en: "Send reset link", it: "Invia link di reimpostazione", es: "Enviar enlace" },
  email_sent_title: { en: "Check your email", it: "Controlla la tua email", es: "Revisa tu correo" },
  reset_sent_body: {
    en: "If an account exists for {email}, we've sent it a password reset link. It expires in 60 minutes.",
    it: "Se esiste un account per {email}, abbiamo inviato un link di reimpostazione. Scade tra 60 minuti.",
    es: "Si existe una cuenta para {email}, le hemos enviado un enlace de restablecimiento. Caduca en 60 minutos.",
  },
  verify_sent_body: {
    en: "We sent a confirmation link to {email}. Click it to activate your account, then log in.",
    it: "Abbiamo inviato un link di conferma a {email}. Fai clic per attivare il tuo account, poi accedi.",
    es: "Enviamos un enlace de confirmación a {email}. Haz clic para activar tu cuenta y luego inicia sesión.",
  },
  reset_title: { en: "Choose a new password", it: "Scegli una nuova password", es: "Elige una nueva contraseña" },
  reset_submit: { en: "Set password", it: "Imposta password", es: "Establecer contraseña" },
  login_invalid_link: {
    en: "That link is invalid or has expired. Request a new one below.",
    it: "Il link non è valido o è scaduto. Richiedine uno nuovo qui sotto.",
    es: "Ese enlace no es válido o ha caducado. Solicita uno nuevo abajo.",
  },
  error_invalid_credentials: {
    en: "Incorrect email or password.",
    it: "Email o password errata.",
    es: "Correo o contraseña incorrectos.",
  },
  error_unverified: {
    en: "Please confirm your email first — check your inbox for the confirmation link.",
    it: "Conferma prima la tua email — controlla la posta per il link di conferma.",
    es: "Confirma primero tu correo — busca el enlace de confirmación en tu bandeja de entrada.",
  },
  error_account_exists: {
    en: "An account with this email already exists. Log in instead.",
    it: "Esiste già un account con questa email. Accedi invece.",
    es: "Ya existe una cuenta con este correo. Inicia sesión.",
  },
  error_no_password: {
    en: "This account doesn't have a password yet. Use \"Forgot password?\" below to set one.",
    it: "Questo account non ha ancora una password. Usa \"Password dimenticata?\" qui sotto per impostarne una.",
    es: "Esta cuenta aún no tiene contraseña. Usa \"¿Olvidaste tu contraseña?\" abajo para crear una.",
  },
  password_too_short: {
    en: "Password must be at least 8 characters.",
    it: "La password deve avere almeno 8 caratteri.",
    es: "La contraseña debe tener al menos 8 caracteres.",
  },

  // Onboarding
  welcome_title: {
    en: "Welcome — tell us about you",
    it: "Benvenuto — parlaci di te",
    es: "Bienvenido — cuéntanos de ti",
  },
  welcome_sub: {
    en: "This is shown to your project teams and sets the language you'll see everything in.",
    it: "Queste informazioni sono visibili ai team di progetto e definiscono la lingua in cui vedrai tutto.",
    es: "Esta información se muestra a tus equipos de proyecto y define el idioma en el que verás todo.",
  },
  field_name: { en: "Full name", it: "Nome e cognome", es: "Nombre completo" },
  field_company: { en: "Company", it: "Azienda", es: "Empresa" },
  field_phone: { en: "Phone", it: "Telefono", es: "Teléfono" },
  field_language: { en: "Preferred language", it: "Lingua preferita", es: "Idioma preferido" },
  welcome_submit: { en: "Continue", it: "Continua", es: "Continuar" },

  // Dashboard
  dashboard_title: { en: "Projects", it: "Progetti", es: "Proyectos" },
  dashboard_empty_title: { en: "No projects yet", it: "Nessun progetto", es: "Aún no hay proyectos" },
  dashboard_empty_body: {
    en: "Create your first project checklist, or ask a project owner to invite you.",
    it: "Crea la tua prima lista di progetto, oppure chiedi a un titolare di progetto di invitarti.",
    es: "Crea tu primera lista de proyecto, o pide a un propietario de proyecto que te invite.",
  },
  new_project: { en: "New project", it: "Nuovo progetto", es: "Nuevo proyecto" },
  role_owner: { en: "Owner", it: "Titolare", es: "Propietario" },
  role_editor: { en: "Editor", it: "Editore", es: "Editor" },
  role_commenter: { en: "Commenter", it: "Commentatore", es: "Comentarista" },
  progress_done: {
    en: "{done} of {total} complete",
    it: "{done} di {total} completate",
    es: "{done} de {total} completadas",
  },
  archived: { en: "Archived", it: "Archiviato", es: "Archivado" },

  // New project
  new_project_title: { en: "New project", it: "Nuovo progetto", es: "Nuevo proyecto" },
  new_project_sub: {
    en: "Name the job and add the site details. You'll add checklist sections next.",
    it: "Dai un nome al lavoro e aggiungi i dettagli del cantiere. Aggiungerai le sezioni della lista subito dopo.",
    es: "Ponle nombre al trabajo y añade los datos de la obra. Después añadirás las secciones de la lista.",
  },
  field_project_name: { en: "Project name", it: "Nome del progetto", es: "Nombre del proyecto" },
  field_address: { en: "Site address", it: "Indirizzo del cantiere", es: "Dirección de la obra" },
  field_description: { en: "Description", it: "Descrizione", es: "Descripción" },
  create_project: { en: "Create project", it: "Crea progetto", es: "Crear proyecto" },

  // Project page
  add_section: { en: "Add section", it: "Aggiungi sezione", es: "Añadir sección" },
  section_name_placeholder: {
    en: "Section name — e.g. Foundation, Framing, Electrical",
    it: "Nome sezione — es. Fondazioni, Struttura, Impianto elettrico",
    es: "Nombre de la sección — ej. Cimentación, Estructura, Instalación eléctrica",
  },
  add_item: { en: "Add item", it: "Aggiungi voce", es: "Añadir tarea" },
  item_title_placeholder: {
    en: "What needs to be done?",
    it: "Cosa deve essere fatto?",
    es: "¿Qué hay que hacer?",
  },
  no_sections_yet: {
    en: "Start by adding a section — a phase of the job like Foundation, Framing, or Finishes.",
    it: "Inizia aggiungendo una sezione — una fase del lavoro come Fondazioni, Struttura o Finiture.",
    es: "Empieza añadiendo una sección — una fase del trabajo como Cimentación, Estructura o Acabados.",
  },
  no_items_yet: {
    en: "No items in this section yet.",
    it: "Nessuna voce in questa sezione.",
    es: "Aún no hay tareas en esta sección.",
  },
  status_open: { en: "Open", it: "Aperto", es: "Pendiente" },
  status_in_progress: { en: "In progress", it: "In corso", es: "En curso" },
  status_done: { en: "Done", it: "Completato", es: "Completado" },
  due: { en: "Due {date}", it: "Scadenza {date}", es: "Vence {date}" },
  overdue: { en: "Overdue", it: "In ritardo", es: "Atrasada" },
  members: { en: "Members", it: "Membri", es: "Miembros" },
  project_settings: { en: "Project settings", it: "Impostazioni progetto", es: "Configuración del proyecto" },
  translated_note: {
    en: "Translated automatically — original in {lang}",
    it: "Tradotto automaticamente — originale in {lang}",
    es: "Traducido automáticamente — original en {lang}",
  },
  preview_language: {
    en: "View in another language",
    it: "Vedi in un'altra lingua",
    es: "Ver en otro idioma",
  },
  preview_language_note: {
    en: "Previewing in {lang} — this is what members with that language see.",
    it: "Anteprima in {lang} — è ciò che vedono i membri con quella lingua.",
    es: "Vista previa en {lang} — esto es lo que ven los miembros con ese idioma.",
  },
  preview_exit: { en: "Back to my language", it: "Torna alla mia lingua", es: "Volver a mi idioma" },

  error_too_many: {
    en: "Too many attempts. Please wait a few minutes and try again.",
    it: "Troppi tentativi. Attendi qualche minuto e riprova.",
    es: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  },
  resend_verification: {
    en: "Resend confirmation email",
    it: "Reinvia email di conferma",
    es: "Reenviar correo de confirmación",
  },
  my_items: { en: "My items", it: "Le mie voci", es: "Mis tareas" },
  all_items: { en: "All items", it: "Tutte le voci", es: "Todas las tareas" },
  confirm_delete: { en: "Confirm delete", it: "Conferma eliminazione", es: "Confirmar eliminación" },
  move_up: { en: "Move up", it: "Sposta su", es: "Subir" },
  move_down: { en: "Move down", it: "Sposta giù", es: "Bajar" },
  template_pick_label: {
    en: "Or start from a template for your kind of job:",
    it: "Oppure parti da un modello per il tuo tipo di lavoro:",
    es: "O empieza con una plantilla para tu tipo de trabajo:",
  },
  caption_placeholder: { en: "Add caption…", it: "Aggiungi didascalia…", es: "Añadir leyenda…" },
  photo_unsupported: {
    en: "This image format isn't supported by your browser.",
    it: "Questo formato immagine non è supportato dal tuo browser.",
    es: "Tu navegador no admite este formato de imagen.",
  },

  // Emails: account exists (anti-enumeration signup notice)
  email_exists_subject: {
    en: "You already have a MonthlyAlerts account",
    it: "Hai già un account MonthlyAlerts",
    es: "Ya tienes una cuenta de MonthlyAlerts",
  },
  email_exists_body: {
    en: "Someone (probably you) tried to sign up with this email, but an account already exists. Log in with your password, or reset it if you've forgotten it. If this wasn't you, you can ignore this email.",
    it: "Qualcuno (probabilmente tu) ha provato a registrarsi con questa email, ma esiste già un account. Accedi con la tua password, oppure reimpostala se l'hai dimenticata. Se non sei stato tu, puoi ignorare questa email.",
    es: "Alguien (probablemente tú) intentó registrarse con este correo, pero ya existe una cuenta. Inicia sesión con tu contraseña o restablécela si la olvidaste. Si no fuiste tú, puedes ignorar este correo.",
  },

  // Emails: task assignment
  email_assign_subject: {
    en: "New task on {project}: {item}",
    it: "Nuovo compito su {project}: {item}",
    es: "Nueva tarea en {project}: {item}",
  },
  email_assign_body: {
    en: "{assigner} assigned you a checklist item on \"{project}\":",
    it: "{assigner} ti ha assegnato una voce della lista su \"{project}\":",
    es: "{assigner} te asignó una tarea de la lista en \"{project}\":",
  },
  email_assign_due: { en: "Due: {date}", it: "Scadenza: {date}", es: "Vence: {date}" },
  email_assign_button: { en: "Open item", it: "Apri voce", es: "Abrir tarea" },

  // Emails: expiration warning
  email_expiry_subject: {
    en: "\"{project}\" will be deleted on {date}",
    it: "\"{project}\" sarà eliminato il {date}",
    es: "\"{project}\" se eliminará el {date}",
  },
  email_expiry_body: {
    en: "Your project \"{project}\" reaches the end of its two-year storage period on {date}. On that date the project — checklist, comments, budgets, and photos — will be permanently deleted. Print the checklist or save anything you need to keep before then.",
    it: "Il tuo progetto \"{project}\" raggiunge la fine del periodo di conservazione di due anni il {date}. In quella data il progetto — lista, commenti, budget e foto — sarà eliminato definitivamente. Stampa la lista o salva ciò che ti serve prima di allora.",
    es: "Tu proyecto \"{project}\" llega al final de su período de almacenamiento de dos años el {date}. En esa fecha el proyecto — lista, comentarios, presupuestos y fotos — se eliminará permanentemente. Imprime la lista o guarda lo que necesites antes.",
  },

  // Budgets
  budget_label: { en: "Budget", it: "Budget", es: "Presupuesto" },
  actual_label: { en: "Actual", it: "Effettivo", es: "Real" },
  budget_set: { en: "Set budget", it: "Imposta budget", es: "Definir presupuesto" },
  currency_label: { en: "Currency", it: "Valuta", es: "Moneda" },
  over_budget: { en: "over budget", it: "oltre il budget", es: "sobre el presupuesto" },

  // Item detail
  item_details: { en: "Details", it: "Dettagli", es: "Detalles" },
  field_status: { en: "Status", it: "Stato", es: "Estado" },
  field_assignee: { en: "Assigned to", it: "Assegnato a", es: "Asignado a" },
  field_due_date: { en: "Due date", it: "Data di scadenza", es: "Fecha límite" },
  unassigned: { en: "Unassigned", it: "Non assegnato", es: "Sin asignar" },
  photos: { en: "Photos", it: "Foto", es: "Fotos" },
  add_photo: { en: "Add photo", it: "Aggiungi foto", es: "Añadir foto" },
  comments: { en: "Comments", it: "Commenti", es: "Comentarios" },
  comment_placeholder: { en: "Write a comment…", it: "Scrivi un commento…", es: "Escribe un comentario…" },
  post_comment: { en: "Post", it: "Invia", es: "Publicar" },
  no_comments: { en: "No comments yet.", it: "Nessun commento.", es: "Aún no hay comentarios." },
  delete_item_confirm: {
    en: "Delete this item and its photos and comments?",
    it: "Eliminare questa voce con le sue foto e i suoi commenti?",
    es: "¿Eliminar esta tarea con sus fotos y comentarios?",
  },
  added_by: { en: "Added by {name}", it: "Aggiunto da {name}", es: "Añadido por {name}" },

  // Project settings / members
  settings_project_title: { en: "Project settings", it: "Impostazioni progetto", es: "Configuración del proyecto" },
  invite_member: { en: "Invite member", it: "Invita membro", es: "Invitar miembro" },
  invite_role_label: { en: "Role", it: "Ruolo", es: "Rol" },
  invite_send: { en: "Send invitation", it: "Invia invito", es: "Enviar invitación" },
  invite_pending: { en: "Pending invitations", it: "Inviti in sospeso", es: "Invitaciones pendientes" },
  invite_expires: { en: "Expires {date}", it: "Scade {date}", es: "Caduca {date}" },
  invite_revoke: { en: "Revoke", it: "Revoca", es: "Revocar" },
  member_remove: { en: "Remove", it: "Rimuovi", es: "Quitar" },
  role_editor_desc: {
    en: "Can add and edit items, check work off, and upload photos",
    it: "Può aggiungere e modificare voci, spuntare lavori e caricare foto",
    es: "Puede añadir y editar tareas, marcar trabajos como hechos y subir fotos",
  },
  role_commenter_desc: {
    en: "Can view the checklist and add comments",
    it: "Può vedere la lista e aggiungere commenti",
    es: "Puede ver la lista y añadir comentarios",
  },
  archive_project: { en: "Archive project", it: "Archivia progetto", es: "Archivar proyecto" },
  unarchive_project: { en: "Unarchive project", it: "Ripristina progetto", es: "Restaurar proyecto" },
  archive_hint: {
    en: "Archived projects are read-only and stop sending monthly updates.",
    it: "I progetti archiviati sono in sola lettura e non inviano più aggiornamenti mensili.",
    es: "Los proyectos archivados son de solo lectura y dejan de enviar actualizaciones mensuales.",
  },
  delete_project: { en: "Delete project", it: "Elimina progetto", es: "Eliminar proyecto" },
  delete_project_confirm: {
    en: "Permanently delete this project, its checklist, photos, and members? This cannot be undone.",
    it: "Eliminare definitivamente questo progetto con lista, foto e membri? L'operazione non può essere annullata.",
    es: "¿Eliminar permanentemente este proyecto con su lista, fotos y miembros? No se puede deshacer.",
  },
  project_expires: {
    en: "Project storage until {date}",
    it: "Archiviazione del progetto fino al {date}",
    es: "Almacenamiento del proyecto hasta el {date}",
  },
  expiry_hint: {
    en: "Projects and their photos are stored for two years from payment, then deleted automatically.",
    it: "I progetti e le loro foto vengono conservati per due anni dal pagamento, poi eliminati automaticamente.",
    es: "Los proyectos y sus fotos se conservan durante dos años desde el pago y luego se eliminan automáticamente.",
  },
  extend_button: {
    en: "Extend storage {years} more years — {price}",
    it: "Estendi l'archiviazione di altri {years} anni — {price}",
    es: "Extiende el almacenamiento {years} años más — {price}",
  },
  extend_success_title: {
    en: "Storage extended",
    it: "Archiviazione estesa",
    es: "Almacenamiento extendido",
  },
  extend_success_body: {
    en: "Thank you — this project is now stored until {date}.",
    it: "Grazie — questo progetto sarà ora conservato fino al {date}.",
    es: "Gracias — este proyecto se conservará ahora hasta el {date}.",
  },

  // Invite acceptance
  invite_title: { en: "You're invited", it: "Sei stato invitato", es: "Estás invitado" },
  invite_body: {
    en: "{inviter} invited you to join the project \"{project}\" on MonthlyAlerts as {role}.",
    it: "{inviter} ti ha invitato a unirti al progetto \"{project}\" su MonthlyAlerts come {role}.",
    es: "{inviter} te invitó a unirte al proyecto \"{project}\" en MonthlyAlerts como {role}.",
  },
  invite_accept: { en: "Accept invitation", it: "Accetta invito", es: "Aceptar invitación" },
  invite_create_password: {
    en: "Create a password for your account ({email}) to join the project.",
    it: "Crea una password per il tuo account ({email}) per unirti al progetto.",
    es: "Crea una contraseña para tu cuenta ({email}) para unirte al proyecto.",
  },
  invite_join: { en: "Create account & join", it: "Crea account e unisciti", es: "Crear cuenta y unirse" },
  invite_log_in_to_accept: {
    en: "This email already has an account. Log in to accept the invitation.",
    it: "Questa email ha già un account. Accedi per accettare l'invito.",
    es: "Este correo ya tiene una cuenta. Inicia sesión para aceptar la invitación.",
  },
  invite_language_label: {
    en: "Invitation language",
    it: "Lingua dell'invito",
    es: "Idioma de la invitación",
  },
  invite_invalid: {
    en: "This invitation is invalid, expired, or was already used.",
    it: "Questo invito non è valido, è scaduto o è già stato utilizzato.",
    es: "Esta invitación no es válida, ha caducado o ya fue utilizada.",
  },
  invite_wrong_account: {
    en: "This invitation was sent to {email}, but you're logged in as {current}. Log out and use the invited address.",
    it: "Questo invito è stato inviato a {email}, ma hai effettuato l'accesso come {current}. Esci e usa l'indirizzo invitato.",
    es: "Esta invitación se envió a {email}, pero has iniciado sesión como {current}. Cierra sesión y usa la dirección invitada.",
  },

  // User settings
  settings_title: { en: "Settings", it: "Impostazioni", es: "Configuración" },
  settings_profile: { en: "Profile", it: "Profilo", es: "Perfil" },
  settings_email_prefs: { en: "Email preferences", it: "Preferenze email", es: "Preferencias de correo" },
  settings_monthly_email: {
    en: "Send me the monthly project status email",
    it: "Inviami l'email mensile sullo stato dei progetti",
    es: "Envíame el correo mensual de estado de los proyectos",
  },
  saved: { en: "Saved", it: "Salvato", es: "Guardado" },

  // Unsubscribe
  unsubscribe_done_title: { en: "You're unsubscribed", it: "Iscrizione annullata", es: "Suscripción cancelada" },
  unsubscribe_done_body: {
    en: "You'll no longer receive monthly status emails. You can turn them back on any time in Settings.",
    it: "Non riceverai più le email mensili di stato. Puoi riattivarle in qualsiasi momento nelle Impostazioni.",
    es: "Ya no recibirás los correos mensuales de estado. Puedes reactivarlos cuando quieras en Configuración.",
  },

  // Emails
  email_verify_subject: {
    en: "Confirm your email — MonthlyAlerts",
    it: "Conferma la tua email — MonthlyAlerts",
    es: "Confirma tu correo — MonthlyAlerts",
  },
  email_verify_title: { en: "Confirm your email", it: "Conferma la tua email", es: "Confirma tu correo" },
  email_verify_body: {
    en: "Click the button below to confirm your email address and activate your MonthlyAlerts account. This link expires in 60 minutes.",
    it: "Fai clic sul pulsante qui sotto per confermare il tuo indirizzo email e attivare il tuo account MonthlyAlerts. Questo link scade tra 60 minuti.",
    es: "Haz clic en el botón de abajo para confirmar tu correo y activar tu cuenta de MonthlyAlerts. Este enlace caduca en 60 minutos.",
  },
  email_verify_button: { en: "Confirm email", it: "Conferma email", es: "Confirmar correo" },
  email_reset_subject: {
    en: "Reset your MonthlyAlerts password",
    it: "Reimposta la tua password MonthlyAlerts",
    es: "Restablece tu contraseña de MonthlyAlerts",
  },
  email_reset_title: { en: "Reset your password", it: "Reimposta la password", es: "Restablece tu contraseña" },
  email_reset_body: {
    en: "Click the button below to choose a new password. This link expires in 60 minutes and can be used once.",
    it: "Fai clic sul pulsante qui sotto per scegliere una nuova password. Questo link scade tra 60 minuti e può essere usato una sola volta.",
    es: "Haz clic en el botón de abajo para elegir una nueva contraseña. Este enlace caduca en 60 minutos y solo puede usarse una vez.",
  },
  email_reset_button: { en: "Choose new password", it: "Scegli nuova password", es: "Elegir nueva contraseña" },
  email_ignore: {
    en: "If you didn't request this, you can safely ignore this email.",
    it: "Se non l'hai richiesto tu, puoi ignorare questa email.",
    es: "Si no lo solicitaste, puedes ignorar este correo.",
  },
  email_invite_subject: {
    en: "{inviter} invited you to \"{project}\" on MonthlyAlerts",
    it: "{inviter} ti ha invitato a \"{project}\" su MonthlyAlerts",
    es: "{inviter} te invitó a \"{project}\" en MonthlyAlerts",
  },
  email_invite_button: { en: "View invitation", it: "Vedi invito", es: "Ver invitación" },
  email_invite_expiry: {
    en: "This invitation expires in 14 days.",
    it: "Questo invito scade tra 14 giorni.",
    es: "Esta invitación caduca en 14 días.",
  },
  email_monthly_subject: {
    en: "{project} — {month} status update",
    it: "{project} — aggiornamento di {month}",
    es: "{project} — actualización de {month}",
  },
  email_monthly_title: { en: "{month} status", it: "Stato di {month}", es: "Estado de {month}" },
  email_monthly_progress: { en: "Overall progress", it: "Avanzamento complessivo", es: "Avance general" },
  email_monthly_completed: { en: "Completed this month", it: "Completate questo mese", es: "Completadas este mes" },
  email_monthly_added: { en: "Added this month", it: "Aggiunte questo mese", es: "Añadidas este mes" },
  email_monthly_overdue: { en: "Overdue", it: "In ritardo", es: "Atrasadas" },
  email_monthly_overdue_list: { en: "Overdue items", it: "Voci in ritardo", es: "Tareas atrasadas" },
  email_monthly_open_project: { en: "Open project", it: "Apri progetto", es: "Abrir proyecto" },
  email_monthly_unsubscribe: {
    en: "Stop receiving these monthly updates",
    it: "Smetti di ricevere questi aggiornamenti mensili",
    es: "Dejar de recibir estas actualizaciones mensuales",
  },
  email_footer: {
    en: "MonthlyAlerts.com — multilingual construction checklists.",
    it: "MonthlyAlerts.com — liste di controllo multilingue per l'edilizia.",
    es: "MonthlyAlerts.com — listas de control de obra multilingües.",
  },

  // Pricing
  pricing_label: { en: "Pricing", it: "Prezzi", es: "Precios" },
  pricing_per_project: { en: "per project", it: "a progetto", es: "por proyecto" },
  pricing_body: {
    en: "One-time fee when you create a project — no subscription. Unlimited checklist items and photos, and your whole team of subs, inspectors, and crew joins free.",
    it: "Tariffa una tantum alla creazione del progetto — nessun abbonamento. Voci e foto illimitate, e tutta la squadra di subappaltatori, ispettori e operai partecipa gratis.",
    es: "Pago único al crear el proyecto — sin suscripción. Tareas y fotos ilimitadas, y todo tu equipo de subcontratistas, inspectores y cuadrilla participa gratis.",
  },
  pricing_invitees_free: {
    en: "Free for everyone you invite",
    it: "Gratis per tutti gli invitati",
    es: "Gratis para todos los invitados",
  },
  new_project_fee: {
    en: "One-time project fee: {price}. You'll be taken to secure checkout to activate the project.",
    it: "Tariffa una tantum: {price}. Verrai reindirizzato al pagamento sicuro per attivare il progetto.",
    es: "Pago único por proyecto: {price}. Serás dirigido a un pago seguro para activar el proyecto.",
  },

  // Legal
  footer_terms: { en: "Terms of Use", it: "Termini di utilizzo", es: "Términos de uso" },
  footer_privacy: { en: "Privacy Policy", it: "Informativa sulla privacy", es: "Política de privacidad" },
  footer_contact: { en: "Contact", it: "Contatti", es: "Contacto" },
  footer_for_contractors: {
    en: "For contractors",
    it: "Per imprese edili",
    es: "Para contratistas",
  },
  footer_renovating_italy: {
    en: "Renovating in Italy",
    it: "Ristrutturare in Italia",
    es: "Renovar en Italia",
  },
  footer_for_designers: {
    en: "For designers & architects",
    it: "Per designer e architetti",
    es: "Para diseñadores y arquitectos",
  },
  footer_for_homeowners: {
    en: "For homeowners",
    it: "Per proprietari di casa",
    es: "Para propietarios",
  },

  // Landing: how it works
  hiw_title: { en: "How it works", it: "Come funziona", es: "Cómo funciona" },
  hiw_step1_title: { en: "Set up your checklist", it: "Crea la tua checklist", es: "Crea tu lista" },
  hiw_step1_body: {
    en: "Create a project and pick your construction phases — site prep to final inspection — from ready-made templates, or build your own.",
    it: "Crea un progetto e scegli le fasi di cantiere — dalla preparazione al collaudo finale — da modelli pronti, o costruisci le tue.",
    es: "Crea un proyecto y elige tus fases de obra — de la preparación del terreno a la inspección final — con plantillas listas, o crea las tuyas.",
  },
  hiw_step2_title: { en: "Invite your crew", it: "Invita la tua squadra", es: "Invita a tu equipo" },
  hiw_step2_body: {
    en: "Add subs, inspectors, and clients by email, each with their own language. Invitees join free.",
    it: "Aggiungi subappaltatori, ispettori e clienti via email, ognuno con la propria lingua. Gli invitati partecipano gratis.",
    es: "Agrega subcontratistas, inspectores y clientes por correo, cada uno con su propio idioma. Los invitados participan gratis.",
  },
  hiw_step3_title: { en: "Work the same list", it: "Lavorate sulla stessa lista", es: "Trabajen la misma lista" },
  hiw_step3_body: {
    en: "Everyone sees the checklist in their language — items, comments, and photo captions translated automatically.",
    it: "Tutti vedono la checklist nella propria lingua: voci, commenti e didascalie delle foto tradotti automaticamente.",
    es: "Todos ven la lista en su idioma: tareas, comentarios y leyendas de fotos traducidos automáticamente.",
  },
  hiw_step4_title: { en: "Get the monthly update", it: "Ricevi l'aggiornamento mensile", es: "Recibe la actualización mensual" },
  hiw_step4_body: {
    en: "Every member gets a monthly status email in their language: progress, what's done, what's overdue.",
    it: "Ogni membro riceve ogni mese un'email di stato nella propria lingua: avanzamento, cosa è fatto, cosa è in ritardo.",
    es: "Cada miembro recibe cada mes un correo de estado en su idioma: avance, lo terminado y lo atrasado.",
  },
  hiw_demo_label: {
    en: "The same item, seen by three crew members",
    it: "La stessa voce, vista da tre membri della squadra",
    es: "La misma tarea, vista por tres miembros del equipo",
  },

  // In-app feedback
  feedback_button: { en: "Feedback", it: "Feedback", es: "Comentarios" },
  feedback_title: { en: "Send us feedback", it: "Inviaci un feedback", es: "Envíanos tus comentarios" },
  feedback_placeholder: {
    en: "What's working? What's missing?",
    it: "Cosa funziona? Cosa manca?",
    es: "¿Qué funciona? ¿Qué falta?",
  },
  feedback_send: { en: "Send", it: "Invia", es: "Enviar" },
  feedback_thanks: {
    en: "Thanks — your feedback is on its way.",
    it: "Grazie — il tuo feedback è stato inviato.",
    es: "Gracias — tus comentarios fueron enviados.",
  },
  contact_title: { en: "Contact us", it: "Contattaci", es: "Contáctanos" },
  contact_intro: {
    en: "Questions, feedback, or a problem with your account — send us a message and we'll get back to you by email.",
    it: "Domande, suggerimenti o un problema con il tuo account: inviaci un messaggio e ti risponderemo via email.",
    es: "Preguntas, comentarios o un problema con tu cuenta: envíanos un mensaje y te responderemos por correo.",
  },
  contact_name: { en: "Name", it: "Nome", es: "Nombre" },
  contact_email: { en: "Your email", it: "La tua email", es: "Tu correo" },
  contact_subject: { en: "Subject", it: "Oggetto", es: "Asunto" },
  contact_message: { en: "Message", it: "Messaggio", es: "Mensaje" },
  contact_send: { en: "Send message", it: "Invia messaggio", es: "Enviar mensaje" },
  contact_sending: { en: "Sending…", it: "Invio…", es: "Enviando…" },
  contact_sent_title: { en: "Message sent", it: "Messaggio inviato", es: "Mensaje enviado" },
  contact_sent_body: {
    en: "Thanks — we'll reply to your email address soon.",
    it: "Grazie — ti risponderemo presto al tuo indirizzo email.",
    es: "Gracias — te responderemos pronto a tu correo.",
  },
  contact_error: {
    en: "Something went wrong. Please try again in a moment.",
    it: "Si è verificato un errore. Riprova tra qualche istante.",
    es: "Algo salió mal. Inténtalo de nuevo en un momento.",
  },
  settings_delete_account: {
    en: "To delete your account and data, email {email} from your account address.",
    it: "Per eliminare il tuo account e i tuoi dati, scrivi a {email} dall'indirizzo del tuo account.",
    es: "Para eliminar tu cuenta y tus datos, escribe a {email} desde la dirección de tu cuenta.",
  },
  new_project_legal: {
    en: "By creating a project you agree to:",
    it: "Creando un progetto accetti:",
    es: "Al crear un proyecto aceptas:",
  },
  legal_english_note: {
    en: "This document is provided in English. The English version is the authoritative version.",
    it: "Questo documento è fornito in inglese. La versione inglese è quella che fa fede.",
    es: "Este documento se proporciona en inglés. La versión en inglés es la versión autorizada.",
  },

  // Billing
  billing_required_title: { en: "Activate this project", it: "Attiva questo progetto", es: "Activa este proyecto" },
  billing_required_body: {
    en: "New projects require a one-time project fee. You'll be taken to secure checkout.",
    it: "I nuovi progetti richiedono una tariffa una tantum. Verrai reindirizzato al pagamento sicuro.",
    es: "Los proyectos nuevos requieren un pago único. Serás dirigido a un pago seguro.",
  },
  billing_checkout: { en: "Continue to checkout", it: "Procedi al pagamento", es: "Continuar al pago" },
  billing_success_title: { en: "Project activated", it: "Progetto attivato", es: "Proyecto activado" },
  billing_success_body: {
    en: "Payment received — your project is ready.",
    it: "Pagamento ricevuto — il tuo progetto è pronto.",
    es: "Pago recibido — tu proyecto está listo.",
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
