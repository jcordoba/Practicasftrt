Documento Oficial de Requisitos del Sistema de Prácticas Profesionales FTR
Versión: 1.0.2
Proyecto: Sistema de Control de Prácticas para Teología
Fecha: 18-07-2025
Responsable: Javier Francisco Córdoba Perdomo
Colaboradores: Jefa de Sistemas, Coordinador de Prácticas FTR, equipo de desarrollo, usuarios clave

1. Introducción
El objetivo de este sistema es automatizar, facilitar y controlar el proceso de prácticas profesionales de los estudiantes del programa de Teología, asegurando trazabilidad, transparencia, eficiencia, seguridad y mejora continua en la gestión y seguimiento de prácticas en diferentes centros asociados. El sistema estará alineado con las mejores prácticas de la industria, la estrategia mobile-first, los más altos estándares de seguridad, usabilidad y expansión institucional.

2. Alcance del sistema
Gestión integral de estudiantes y prácticas desde el primer al último semestre.


Integración automática y permanente con el sistema académico de matrículas y retiros (SION/SVGA), utilizando los identificadores clave oficiales.


Registro, seguimiento y evaluación de prácticas por parte de pastores tutores, docentes y coordinadores.


Gestión y administración de centros de práctica, asociaciones, distritos, congregaciones e instituciones.


Asignación y traslado de estudiantes a centros de práctica, con historial auditable y sin borrado físico (solo cambio de estado).


Paneles, dashboards y reportes configurables para decanatura, coordinación, usuarios y entes externos.


Expansión futura para nuevas carreras, instituciones y proyectos sociales/misionales.


Interfaz institucional, mobile-first y alineada con la experiencia SION/SVGA.



3. Requisitos funcionales
RF-01. Acceso, autenticación y seguridad (ajustado)
Login con Google Workspace SSO para usuarios con correo institucional @unac.edu.co.


Login por correo y contraseña + 2FA (código temporal enviado al correo registrado) para usuarios externos validados (pastores o encargados sin correo institucional).


Creación de cuentas externas solo por invitación y control del coordinador.


Contraseñas de alta seguridad para usuarios externos: longitud mínima, complejidad, caducidad periódica, y restricción de claves inseguras.


2FA obligatorio: al iniciar sesión, el usuario externo recibe un código temporal (OTP) por email y debe ingresarlo para acceder.


Supervisión y auditoría: toda creación, invitación, acceso, intento fallido y cambio de estado de cuentas externas queda registrada y es revisable por el coordinador y el equipo técnico.


Si un usuario externo obtiene correo institucional, debe migrar a autenticación SSO.


Acceso y funciones estrictamente controlados por roles (estudiante, pastor tutor, docente, coordinador, decano, admin técnico).


Pantalla de login inspirada en SION institucional, con logo, nombre del sistema, mensaje de bienvenida, botón "Iniciar sesión con Google", campos para login externo, enlaces de soporte y aviso de privacidad (Ley 1581/2012).


No se admiten cuentas externas autogestionadas ni registros abiertos: todo acceso externo es aprobado y controlado institucionalmente.



RF-02. Gestión de entidades organizacionales
Administración completa (alta, edición, deshabilitado lógico, no borrado físico) de Uniones, Asociaciones, Distritos, Congregaciones/Iglesias, Instituciones y Centros de práctica.


Carga masiva de entidades desde archivo CSV/Excel.


Visualización mobile-first: tarjetas o listas optimizadas, con filtros, búsqueda y edición rápida.


Configuración de vínculos jerárquicos: cada centro está vinculado a su asociación/distrito y tipo.



RF-03. Gestión y asignación de estudiantes en prácticas
Regla institucional:


Cuando un estudiante matricule dos (o más) prácticas en el mismo semestre académico, el sistema debe garantizar que ambas (o todas) prácticas estén asignadas a la misma iglesia (centro de práctica) y al mismo pastor. El estudiante no puede, bajo ninguna circunstancia, estar asignado a dos iglesias diferentes para sus prácticas activas en un mismo período académico.
Si un estudiante es trasladado, todas sus prácticas activas deben trasladarse juntas a la nueva iglesia y pastor.



Asignación manual de estudiantes a centros de práctica (por comité, coordinador o docente autorizado).


Validaciones en tiempo real: centro debe estar activo y tener cupo disponible; registro automático de fecha, usuario, y motivo en caso de traslado.


Historial completo y auditable de asignaciones, traslados y cambios de centro para cada estudiante y centro.


Notificaciones automáticas por correo a estudiantes y pastores sobre asignación, traslado y cambios de estado.


No borrar estudiantes ni asignaciones; siempre conservar el histórico de participación y cambios de estado (activo, cancelado, retirado, egresado).



RF-04. Seguimiento, evaluación y evidencia
Seguimiento y evaluación en dos cortes semestrales, con conversión automática de resultados en notas.


Formulario digital de evaluación para el pastor tutor, gestionado 100% dentro del sistema (no externo), con criterios de asistencia, liderazgo, puntualidad, etc.


Registro de evidencia fotográfica (solo fotos jpg/png con metadatos de fecha, hora y, si aplica, localización).


Sincronización offline: estudiantes pueden registrar asistencia y subir evidencias sin conexión, datos se suben automáticamente al restablecerse la conectividad.


Validación y visualización de evidencias por parte del pastor y docente.


Observaciones solo en procesos de calificación y seguimiento, no durante la matrícula.



RF-05. Gestión de grupos, calificaciones y reportes
Interfaz tipo SVGA para gestión de grupos/prácticas:


Tabla mobile-first de grupos con prácticas activas, semestres, docentes, centros, cantidad de estudiantes y accesos rápidos.


Vista de estudiantes por grupo, foto, datos clave, estado, y acceso a evaluación.


Tabla de calificaciones por estudiante, cortes, nota final, % cumplimiento, evidencias y comentarios.


Notas editables solo dentro de plazos definidos; bloqueo posterior con mensaje claro.


Exportación de reportes en Excel/PDF para informes institucionales y SNIES.



RF-06. Paneles y dashboards
Dashboard inicial tipo SION (mobile-first):


Accesos rápidos por rol, buscador global, panel de avisos y alertas.


Paneles configurables para seguimiento, consultas y reportes por práctica, centro, periodo, grupo, etc.



RF-07. Experiencia de usuario (UX/UI)
Mobile-first en todo el sistema: todas las pantallas, flujos y formularios optimizados para móviles, con navegación ágil, componentes accesibles y visualización responsiva.


Estética institucional: colores, logos, tipografía y estilo combinados de SION y SVGA, con mejoras para claridad y usabilidad.


Accesibilidad: contraste, navegación teclado, textos legibles, ayudas y mensajes claros.


Formularios y pantallas diseñados para minimizar la carga y esfuerzo del usuario, mostrando solo los datos necesarios según el rol y proceso.



RF-08. Expansión y escalabilidad
El sistema será multi-carrera, multi-institución y multi-proyecto, soportando nuevas entidades, roles, centros y prácticas futuras sin perder trazabilidad ni performance.


Estructura preparada para la integración de nuevas funcionalidades, prácticas y reportes conforme crezcan las necesidades institucionales.


Documentación y endpoints listos para futura integración API con SION y SVGA (importar/exportar información).



4. Requisitos no funcionales
Stack tecnológico sugerido: Next.js (frontend), Node.js (backend), TypeScript, PostgreSQL, ORM recomendado (Prisma/TypeORM).


CI/CD, testing y estándares de calidad: pipeline automático, linters, cobertura de tests, feature flags, integración continua.


Desarrollo seguro y de alta calidad:


El código debe cumplir los más altos estándares de la industria para software seguro y sostenible, conforme a la guía gourmet y mejores prácticas internacionales (OWASP, Clean Code, Secure Coding Guidelines).


Prohibido el uso de patrones inseguros, dependencias obsoletas o vulnerables, o prácticas de bajo estándar.


Auditoría de código, peer review, testing automatizado y documentación obligatoria en cada avance.


Documentación viva: Readme, diagramas, ADRs, wiki de onboarding y buenas prácticas.


Mantenibilidad y escalabilidad: código tipado fuerte, modular, fácil de probar, auditar y expandir.



5. Seguridad de la aplicación
Autenticación segura exclusivamente por Google SSO, sin contraseñas locales, con validación estricta de dominio y sesiones.


Autorización estricta por roles, sin escalamiento posible fuera de permisos definidos.


Transmisión cifrada (HTTPS obligatorio siempre), almacenamiento seguro, hashing y salting de cualquier dato sensible.


Protección contra ataques comunes: SQL injection (solo ORM), XSS, CSRF, SSRF, fuerza bruta, rate-limiting, validación exhaustiva de datos de entrada.


Validación y sanitización de archivos subidos; rechazo de formatos inseguros; límite de tamaño.


Logs de seguridad y auditoría: toda acción crítica (login, asignación, traslado, edición, subida de archivos, calificación) debe quedar registrada, con usuario, fecha/hora, IP y contexto.


Política activa de actualización: dependencias, librerías y stack deben mantenerse actualizados y libres de vulnerabilidades conocidas.


Cumplimiento legal: tratamiento y almacenamiento de datos acorde a Ley 1581/2012 y, de ser requerido, GDPR o normativas internacionales.


Backups, monitoreo y alertas: copias de seguridad regulares, dashboards de monitoreo y alertas automáticas para accesos sospechosos o fallos críticos.


Postmortems y mejora continua: cada incidente o bug relevante debe documentarse y generar acciones correctivas.



6. Criterios de aceptación generales
Cada requerimiento funcional estará cubierto por una o varias User Stories, cada una con criterios de aceptación claros.


Ninguna funcionalidad se considera completada hasta que pase pruebas de usuario, integración, aceptación y seguridad.


Todo cambio o mejora pasa por versionado y registro en el historial del documento y el sistema.



7. Notas y observaciones clave
Toda la administración de entidades y asignación de estudiantes está pensada para uso en campo y desde dispositivos móviles.


El sistema debe permitir trazabilidad completa y auditable de todo el ciclo de vida de la práctica.


Evidencias y calificaciones son auditables y exportables para reportes internos y regulatorios.


El sistema es flexible y evolutivo: preparado para cambios, mejoras y nuevas necesidades institucionales sin perder robustez ni seguridad.


No se debe recargar a los usuarios (coordinador, pastor) con información o procesos innecesarios; solo datos mínimos requeridos en cada flujo.



8. Glosario y definiciones clave
Término
Definición
Práctica profesional
Actividad formativa realizada por estudiantes en centros asignados, para aplicar competencias ministeriales.
Centro de práctica
Iglesia, institución o entidad donde el estudiante desarrolla su práctica profesional.
Asociación
División administrativa de la Iglesia Adventista del Séptimo Día, compuesta por varios distritos e iglesias.
Distrito
Conjunto de congregaciones bajo la responsabilidad de un pastor titular.
Congregación/Iglesia
Lugar físico y comunidad donde el estudiante realiza su práctica.
Semestre académico
Periodo lectivo de seis meses que estructura el avance curricular del estudiante.
Corte de seguimiento
Evaluación parcial (a mitad y final del semestre) sobre desempeño y asistencia del estudiante.
Pastor tutor
Pastor responsable de supervisar, acompañar y evaluar al estudiante en el centro de práctica.
Docente de práctica
Profesor universitario encargado del componente académico, asignación, seguimiento y calificación de la práctica.
Evidencia fotográfica
Foto digital con metadatos válida como prueba de actividad o asistencia.
Traslado
Proceso de cambio de un estudiante de un centro de práctica a otro, con registro y motivo.
Sistema académico
Plataforma donde se gestionan matrículas, retiros y registros curriculares.
SNIES
Sistema Nacional de Información de la Educación Superior de Colombia.
Usuario
Persona con acceso al sistema (estudiante, pastor, docente, coordinador, decano, admin técnico).
Matrícula
Inscripción formal del estudiante en semestre y prácticas correspondientes.


9. Actores del sistema
Actor
Rol
Acciones principales
Estudiante
Usuario principal, realiza la práctica.
Consultar asignación, registrar asistencia y evidencias, consultar calificaciones, historial, recibir avisos.
Pastor tutor
Responsable de la práctica en el centro asignado.
Validar asistencia, evaluar desempeño, registrar observaciones, consultar historial, recibir notificaciones.
Docente de práctica
Encargado académico de la práctica.
Asignar estudiantes, gestionar traslados, revisar evaluaciones, generar reportes, actualizar estado académico.
Coordinador de prácticas
Administrador general del proceso de prácticas.
Configurar entidades, gestionar usuarios, administrar calendario, consultar reportes, mantener integración.
Decano
Directivo de la Facultad, acceso global.
Revisar reportes globales, indicadores, aprobar modificaciones mayores al sistema o estructura.
Administrador técnico
Encargado de la infraestructura y seguridad del sistema.
Configurar parámetros técnicos, garantizar respaldo, monitorear logs y métricas, coordinar actualizaciones.
Sistema académico
Plataforma externa proveedora de información de matrículas y retiros en tiempo real.
Emitir eventos/cambios que sincronizan altas, bajas y retiros de estudiantes en el sistema de prácticas.
SNIES
Entidad externa receptora de reportes regulatorios.
Recibir reportes estructurados y consolidados requeridos por la normativa.

10. Modelo de seguridad: Control de Acceso Basado en Roles (RBAC)
Para garantizar la seguridad, escalabilidad y facilidad de administración del sistema SION Prácticas FTR, se implementará el patrón RBAC (Role-Based Access Control), ampliamente utilizado en plataformas académicas y empresariales de alto estándar.
¿Cómo funciona RBAC en este sistema?
Usuarios: Cada usuario registrado puede tener uno o más roles, según sus funciones institucionales.


Roles: Los roles representan grupos de permisos que definen qué acciones y módulos puede usar un usuario. Ejemplos de roles: Estudiante, Pastor Tutor, Docente de Práctica, Coordinador, Decano, Administrador Técnico, etc.


Permisos: Los permisos específicos (crear, editar, ver, eliminar, aprobar, reportar, etc.) se asignan a los roles, y no directamente a los usuarios.


Tabla intermedia UsuarioRol: Permite que un usuario tenga varios roles simultáneamente (ejemplo: docente y coordinador al mismo tiempo), y así, acceda a todas las funciones asociadas a esos roles sin conflictos ni duplicidades.


Ventajas clave
Centralización de permisos: Los administradores pueden modificar los permisos de un rol y estos cambios afectan automáticamente a todos los usuarios que lo tengan, facilitando la gestión y auditoría.


Escalabilidad: Añadir nuevos roles o cambiar los existentes no requiere cambios estructurales en la base de datos ni el código, sólo en la configuración de roles y permisos.


Flexibilidad: Soporta múltiples roles por usuario, permitiendo que las personas que ocupan más de un cargo puedan operar en todas sus funciones institucionales con un solo acceso.


Seguridad: Minimiza los riesgos de privilegios excesivos y evita errores humanos al asignar permisos directamente a usuarios.


Justificación
El patrón RBAC es un estándar en sistemas que requieren trazabilidad, seguridad y cambios frecuentes en la estructura de permisos.


Cumple con los requisitos institucionales y permite a la universidad adaptarse rápidamente a nuevas políticas, cargos o procesos, sin afectar la operación ni la seguridad del sistema.


El sistema SION Prácticas FTR gestionará todos los accesos, vistas, operaciones y flujos críticos usando este modelo de roles y permisos, asegurando así el cumplimiento de las mejores prácticas internacionales en gestión de seguridad y acceso.

Tabla ejemplo de roles y permisos, más una breve explicación visual para tu equipo técnico, lista para incluir en el documento de requisitos.
Tabla ejemplo de roles y permisos (RBAC)
Rol
Descripción
Permisos principales
Estudiante
Usuario que realiza la práctica
Ver prácticas asignadas, registrar asistencia, subir evidencias, ver calificaciones y observaciones propias
Pastor Tutor
Supervisor de estudiantes en centros de práctica
Validar asistencia, evaluar estudiantes, dejar observaciones, ver historial de asignados
Docente de Práctica
Profesor a cargo del seguimiento académico
Asignar estudiantes, gestionar traslados, consolidar evaluaciones, generar reportes, ver/actualizar estado académico
Coordinador
Responsable general del proceso de prácticas
Administrar centros, asociaciones, usuarios; asignar roles, gestionar calendario, consultar reportes globales
Decano
Directivo superior, visión global
Consultar reportes, indicadores, aprobar cambios mayores en estructura y procesos
Administrador Técnico
Encargado de infraestructura y soporte
Configurar parámetros técnicos, monitorear logs, asegurar respaldos y actualizaciones, gestionar seguridad

Ejemplo de tabla intermedia: UsuarioRol
usuario_id
rol_id
fecha_asignacion
estado
1001
1 (Estudiante)
2025-07-01
Activo
1002
2 (Pastor Tutor)
2025-07-01
Activo
1002
4 (Coordinador)
2025-07-02
Activo
1003
3 (Docente)
2025-07-01
Activo

En el ejemplo, el usuario 1002 tiene dos roles y puede operar en ambos contextos según lo permita la aplicación.
Explicación visual del modelo RBAC
Usuarios <---- UsuarioRol ----> Roles <----> Permisos
    |                             
    |_________   (Hereda)   ________|
                \          /
                  Acceso al sistema

Usuarios se vinculan con uno o más roles mediante la tabla UsuarioRol.


Roles agrupan permisos según las acciones y módulos habilitados en la plataforma.


Cuando un usuario inicia sesión, su menú, vistas y acciones dependen de los permisos combinados de todos sus roles activos.


Resumen
El sistema es flexible, seguro y auditable: se pueden sumar, quitar o modificar roles y permisos sin modificar la base de usuarios.


La trazabilidad es total: en cada acción crítica (asignación, evaluación, reporte, administración) siempre se sabe bajo qué rol actuó el usuario.


11. Aprobación y versionamiento
Este documento es la referencia obligatoria para el desarrollo, validación y cambios del sistema.


Todo cambio o petición de ajuste debe registrarse y versionarse, conservando el historial para auditoría y trazabilidad.



