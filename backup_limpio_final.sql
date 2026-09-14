--
-- PostgreSQL database dump
--


-- Dumped from database version 15.19 (Homebrew)
-- Dumped by pg_dump version 15.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: estado_evaluacion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_evaluacion AS ENUM (
    'borrador',
    'publicada',
    'cerrada',
    'archivada'
);


ALTER TYPE public.estado_evaluacion OWNER TO postgres;

--
-- Name: estado_respuesta; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_respuesta AS ENUM (
    'no_iniciada',
    'en_progreso',
    'enviada',
    'calificada'
);


ALTER TYPE public.estado_respuesta OWNER TO postgres;

--
-- Name: rol_usuario; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rol_usuario AS ENUM (
    'admin',
    'docente',
    'estudiante'
);


ALTER TYPE public.rol_usuario OWNER TO postgres;

--
-- Name: tipo_calificacion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_calificacion AS ENUM (
    'automatica',
    'manual',
    'hibrida'
);


ALTER TYPE public.tipo_calificacion OWNER TO postgres;

--
-- Name: tipo_pregunta; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_pregunta AS ENUM (
    'seleccion_multiple',
    'verdadero_falso',
    'respuesta_corta',
    'ensayo',
    'pareo'
);


ALTER TYPE public.tipo_pregunta OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asignaturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asignaturas (
    id integer NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    creditos integer NOT NULL,
    semestre integer NOT NULL,
    activa boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT creditos_validos CHECK ((creditos > 0)),
    CONSTRAINT semestre_valido CHECK (((semestre > 0) AND (semestre <= 12)))
);


ALTER TABLE public.asignaturas OWNER TO postgres;

--
-- Name: asignaturas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asignaturas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.asignaturas_id_seq OWNER TO postgres;

--
-- Name: asignaturas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asignaturas_id_seq OWNED BY public.asignaturas.id;


--
-- Name: calificaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calificaciones (
    id integer NOT NULL,
    estudiante_id integer NOT NULL,
    grupo_id integer NOT NULL,
    puntaje_final numeric(5,2),
    porcentaje_final numeric(5,2),
    nota_definitiva character varying(5),
    estado character varying(50),
    fecha_calculo timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT porcentaje_valido CHECK (((porcentaje_final IS NULL) OR ((porcentaje_final >= (0)::numeric) AND (porcentaje_final <= (100)::numeric))))
);


ALTER TABLE public.calificaciones OWNER TO postgres;

--
-- Name: calificaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calificaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.calificaciones_id_seq OWNER TO postgres;

--
-- Name: calificaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.calificaciones_id_seq OWNED BY public.calificaciones.id;


--
-- Name: docente_asignatura; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.docente_asignatura (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    asignatura_id integer NOT NULL,
    grupo_id integer,
    fecha_inicio date,
    fecha_fin date,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.docente_asignatura OWNER TO postgres;

--
-- Name: docente_asignatura_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.docente_asignatura_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.docente_asignatura_id_seq OWNER TO postgres;

--
-- Name: docente_asignatura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.docente_asignatura_id_seq OWNED BY public.docente_asignatura.id;


--
-- Name: estudiante_asignatura; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estudiante_asignatura (
    id integer NOT NULL,
    estudiante_id integer NOT NULL,
    asignatura_id integer NOT NULL
);


ALTER TABLE public.estudiante_asignatura OWNER TO postgres;

--
-- Name: estudiante_asignatura_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estudiante_asignatura_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.estudiante_asignatura_id_seq OWNER TO postgres;

--
-- Name: estudiante_asignatura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estudiante_asignatura_id_seq OWNED BY public.estudiante_asignatura.id;


--
-- Name: estudiante_grupo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estudiante_grupo (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    grupo_id integer NOT NULL,
    fecha_inscripcion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    activo boolean DEFAULT true
);


ALTER TABLE public.estudiante_grupo OWNER TO postgres;

--
-- Name: estudiante_grupo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estudiante_grupo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.estudiante_grupo_id_seq OWNER TO postgres;

--
-- Name: estudiante_grupo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estudiante_grupo_id_seq OWNED BY public.estudiante_grupo.id;


--
-- Name: evaluaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluaciones (
    id integer NOT NULL,
    grupo_id integer,
    docente_id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    descripcion text,
    tipo_calificacion public.tipo_calificacion DEFAULT 'automatica'::public.tipo_calificacion NOT NULL,
    puntaje_total numeric(5,2) NOT NULL,
    estado public.estado_evaluacion DEFAULT 'borrador'::public.estado_evaluacion NOT NULL,
    fecha_inicio timestamp without time zone,
    fecha_fin timestamp without time zone,
    tiempo_limite_minutos integer,
    intentos_permitidos integer DEFAULT 1,
    mostrar_respuestas_correctas boolean DEFAULT false,
    permitir_revision boolean DEFAULT false,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    asignatura_id integer,
    fecha_presentacion timestamp without time zone,
    "contraseña" character varying(255),
    CONSTRAINT fecha_coherente CHECK ((fecha_inicio < fecha_fin)),
    CONSTRAINT intentos_validos CHECK ((intentos_permitidos > 0)),
    CONSTRAINT puntaje_valido CHECK ((puntaje_total > (0)::numeric)),
    CONSTRAINT tiempo_valido CHECK (((tiempo_limite_minutos IS NULL) OR (tiempo_limite_minutos > 0)))
);


ALTER TABLE public.evaluaciones OWNER TO postgres;

--
-- Name: evaluaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.evaluaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluaciones_id_seq OWNER TO postgres;

--
-- Name: evaluaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evaluaciones_id_seq OWNED BY public.evaluaciones.id;


--
-- Name: exportaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exportaciones (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    tipo_exportacion character varying(50) NOT NULL,
    grupo_id integer,
    asignatura_id integer,
    formato character varying(20) NOT NULL,
    ruta_archivo character varying(500),
    cantidad_registros integer,
    fecha_exportacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT formato_valido CHECK (((formato)::text = ANY ((ARRAY['csv'::character varying, 'xlsx'::character varying, 'pdf'::character varying])::text[])))
);


ALTER TABLE public.exportaciones OWNER TO postgres;

--
-- Name: exportaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exportaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exportaciones_id_seq OWNER TO postgres;

--
-- Name: exportaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exportaciones_id_seq OWNED BY public.exportaciones.id;


--
-- Name: grupos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grupos (
    id integer NOT NULL,
    asignatura_id integer NOT NULL,
    numero_grupo character varying(50) NOT NULL,
    capacidad integer NOT NULL,
    jornada character varying(50),
    aula character varying(50),
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT capacidad_valida CHECK ((capacidad > 0))
);


ALTER TABLE public.grupos OWNER TO postgres;

--
-- Name: grupos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grupos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.grupos_id_seq OWNER TO postgres;

--
-- Name: grupos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grupos_id_seq OWNED BY public.grupos.id;


--
-- Name: opciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opciones (
    id integer NOT NULL,
    pregunta_id integer NOT NULL,
    contenido text NOT NULL,
    es_correcta boolean DEFAULT false,
    orden integer,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.opciones OWNER TO postgres;

--
-- Name: opciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.opciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.opciones_id_seq OWNER TO postgres;

--
-- Name: opciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.opciones_id_seq OWNED BY public.opciones.id;


--
-- Name: preguntas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preguntas (
    id integer NOT NULL,
    evaluacion_id integer NOT NULL,
    tipo public.tipo_pregunta NOT NULL,
    enunciado text NOT NULL,
    puntaje numeric(5,2),
    orden integer NOT NULL,
    es_obligatoria boolean DEFAULT true,
    explicacion_respuesta text,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT puntaje_valido CHECK ((puntaje > (0)::numeric))
);


ALTER TABLE public.preguntas OWNER TO postgres;

--
-- Name: preguntas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.preguntas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.preguntas_id_seq OWNER TO postgres;

--
-- Name: preguntas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.preguntas_id_seq OWNED BY public.preguntas.id;


--
-- Name: respuesta_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.respuesta_detalle (
    id integer NOT NULL,
    respuesta_estudiante_id integer NOT NULL,
    pregunta_id integer NOT NULL,
    respuesta_texto text,
    opcion_seleccionada_id integer,
    puntaje_obtenido numeric(5,2),
    retroalimentacion text,
    calificada_manualmente boolean DEFAULT false,
    fecha_calificacion timestamp without time zone,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.respuesta_detalle OWNER TO postgres;

--
-- Name: respuesta_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.respuesta_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.respuesta_detalle_id_seq OWNER TO postgres;

--
-- Name: respuesta_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.respuesta_detalle_id_seq OWNED BY public.respuesta_detalle.id;


--
-- Name: respuestas_estudiante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.respuestas_estudiante (
    id integer NOT NULL,
    evaluacion_id integer NOT NULL,
    estudiante_id integer NOT NULL,
    estado public.estado_respuesta DEFAULT 'no_iniciada'::public.estado_respuesta NOT NULL,
    fecha_inicio timestamp without time zone,
    fecha_envio timestamp without time zone,
    puntaje_obtenido numeric(5,2),
    porcentaje numeric(5,2),
    intento_numero integer DEFAULT 1,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT porcentaje_valido CHECK (((porcentaje IS NULL) OR ((porcentaje >= (0)::numeric) AND (porcentaje <= (100)::numeric)))),
    CONSTRAINT puntaje_valido CHECK (((puntaje_obtenido IS NULL) OR (puntaje_obtenido >= (0)::numeric)))
);


ALTER TABLE public.respuestas_estudiante OWNER TO postgres;

--
-- Name: respuestas_estudiante_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.respuestas_estudiante_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.respuestas_estudiante_id_seq OWNER TO postgres;

--
-- Name: respuestas_estudiante_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.respuestas_estudiante_id_seq OWNED BY public.respuestas_estudiante.id;


--
-- Name: rubricas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rubricas (
    id integer NOT NULL,
    pregunta_id integer NOT NULL,
    criterio character varying(255) NOT NULL,
    puntaje_maximo numeric(5,2) NOT NULL,
    descripcion text,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT puntaje_valido CHECK ((puntaje_maximo > (0)::numeric))
);


ALTER TABLE public.rubricas OWNER TO postgres;

--
-- Name: rubricas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rubricas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rubricas_id_seq OWNER TO postgres;

--
-- Name: rubricas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rubricas_id_seq OWNED BY public.rubricas.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    "contraseña_hash" character varying(255) NOT NULL,
    nombre_completo character varying(255) NOT NULL,
    apellido character varying(255) NOT NULL,
    rol public.rol_usuario NOT NULL,
    activo boolean DEFAULT true,
    telefono character varying(20),
    documento_identidad character varying(50),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_valido CHECK (((email)::text ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'::text))
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: asignaturas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaturas ALTER COLUMN id SET DEFAULT nextval('public.asignaturas_id_seq'::regclass);


--
-- Name: calificaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones ALTER COLUMN id SET DEFAULT nextval('public.calificaciones_id_seq'::regclass);


--
-- Name: docente_asignatura id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docente_asignatura ALTER COLUMN id SET DEFAULT nextval('public.docente_asignatura_id_seq'::regclass);


--
-- Name: estudiante_asignatura id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante_asignatura ALTER COLUMN id SET DEFAULT nextval('public.estudiante_asignatura_id_seq'::regclass);


--
-- Name: estudiante_grupo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante_grupo ALTER COLUMN id SET DEFAULT nextval('public.estudiante_grupo_id_seq'::regclass);


--
-- Name: evaluaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones ALTER COLUMN id SET DEFAULT nextval('public.evaluaciones_id_seq'::regclass);


--
-- Name: exportaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exportaciones ALTER COLUMN id SET DEFAULT nextval('public.exportaciones_id_seq'::regclass);


--
-- Name: grupos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupos ALTER COLUMN id SET DEFAULT nextval('public.grupos_id_seq'::regclass);


--
-- Name: opciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opciones ALTER COLUMN id SET DEFAULT nextval('public.opciones_id_seq'::regclass);


--
-- Name: preguntas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas ALTER COLUMN id SET DEFAULT nextval('public.preguntas_id_seq'::regclass);


--
-- Name: respuesta_detalle id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respuesta_detalle ALTER COLUMN id SET DEFAULT nextval('public.respuesta_detalle_id_seq'::regclass);


--
-- Name: respuestas_estudiante id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respuestas_estudiante ALTER COLUMN id SET DEFAULT nextval('public.respuestas_estudiante_id_seq'::regclass);


--
-- Name: rubricas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rubricas ALTER COLUMN id SET DEFAULT nextval('public.rubricas_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: asignaturas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asignaturas (id, codigo, nombre, descripcion, creditos, semestre, activa, fecha_creacion, fecha_actualizacion) FROM stdin;
1	PROG-WEB-N	Programación Web	Desarrollo web con arquitecturas cliente-servidor, HTML5, CSS3 y JavaScript	4	4	t	2026-09-10 11:57:47.373216	2026-09-10 11:57:47.373216
2	GAC-F10-01	Administración de Bases de Datos	Gestión de SMBD	3	4	t	2026-09-10 19:08:41.072345	2026-09-10 19:08:41.072345
3	GAC-F10-02	Administración Web	Servicios web DNS HTTP FTP DHCP	3	3	t	2026-09-10 19:08:41.072345	2026-09-10 19:08:41.072345
4	GAC-F10-03	Principios y Desarrollo de Software	Ciclo de vida y metodologías	3	2	t	2026-09-10 19:08:41.072345	2026-09-10 19:08:41.072345
16	12345	nueva 	\N	3	1	t	2026-09-12 14:18:37.60385	2026-09-12 14:18:37.60385
\.


--
-- Data for Name: calificaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calificaciones (id, estudiante_id, grupo_id, puntaje_final, porcentaje_final, nota_definitiva, estado, fecha_calculo, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: docente_asignatura; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.docente_asignatura (id, usuario_id, asignatura_id, grupo_id, fecha_inicio, fecha_fin, activo, fecha_creacion) FROM stdin;
1	2	1	1	2026-08-05	\N	t	2026-09-10 11:57:47.413045
4	2	2	1	2026-09-11	\N	t	2026-09-11 18:52:11.226671
5	2	3	1	2026-09-11	\N	t	2026-09-11 18:52:11.226671
6	2	4	1	2026-09-11	\N	t	2026-09-11 18:52:11.226671
11	2	1	\N	\N	\N	t	2026-09-12 14:21:20.90862
12	2	16	\N	\N	\N	t	2026-09-12 14:21:50.471082
\.


--
-- Data for Name: estudiante_asignatura; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estudiante_asignatura (id, estudiante_id, asignatura_id) FROM stdin;
1	3	1
2	3	16
\.


--
-- Data for Name: estudiante_grupo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estudiante_grupo (id, usuario_id, grupo_id, fecha_inscripcion, fecha_actualizacion, activo) FROM stdin;
1	3	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
2	4	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
3	5	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
4	6	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
5	7	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
6	8	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
7	9	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
8	10	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
9	11	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
10	12	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
11	13	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
12	14	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
13	15	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
14	16	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
15	17	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
16	18	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
17	19	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
18	20	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
19	21	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
20	22	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
21	23	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
22	24	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
23	25	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
24	26	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
25	27	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
26	28	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
27	29	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
28	30	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
29	31	1	2026-09-10 11:57:47.423205	2026-09-10 11:57:47.423205	t
\.


--
-- Data for Name: evaluaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evaluaciones (id, grupo_id, docente_id, titulo, descripcion, tipo_calificacion, puntaje_total, estado, fecha_inicio, fecha_fin, tiempo_limite_minutos, intentos_permitidos, mostrar_respuestas_correctas, permitir_revision, fecha_creacion, fecha_actualizacion, asignatura_id, fecha_presentacion, "contraseña") FROM stdin;
1	1	2	Parcial 1: Fundamentos de Programación Web	Evaluación de conceptos de arquitecturas web, HTML5 y CSS	hibrida	100.00	publicada	2026-09-11 09:00:00	2026-09-11 11:00:00	60	1	f	t	2026-09-10 11:57:59.317034	2026-09-10 11:57:59.317034	\N	\N	\N
12	\N	2	PARCIAL 1-B	hjk	automatica	100.00	borrador	\N	\N	60	1	f	f	2026-09-11 19:06:21.278836	2026-09-11 19:06:21.278836	\N	\N	\N
18	\N	2	prueba parcial	contrasena	automatica	100.00	borrador	2026-09-12 10:58:00	2026-09-15 10:58:00	60	1	f	f	2026-09-12 18:59:02.391038	2026-09-12 18:59:02.391038	1	\N	$2b$10$zJF6dDG0UBPFc3shFM3EeuZlcEpzbzEffE5fmtqS9iTZpJ11Gkghe
19	\N	2	fundamentos prueb	parcial prueba 2	automatica	50.00	borrador	2026-09-12 18:10:00	2026-09-14 18:10:00	60	1	f	f	2026-09-13 18:10:29.841401	2026-09-13 18:10:29.841401	1	\N	$2b$10$v.jDwUZ8/QRdKgxJrexqdOPJO6A5145BSTU2SYUr8iwrz71Xq63uu
\.


--
-- Data for Name: exportaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exportaciones (id, usuario_id, tipo_exportacion, grupo_id, asignatura_id, formato, ruta_archivo, cantidad_registros, fecha_exportacion) FROM stdin;
\.


--
-- Data for Name: grupos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grupos (id, asignatura_id, numero_grupo, capacidad, jornada, aula, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
1	1	TP SISTEMAS-4A-DBO	30	Diurna	D301	t	2026-09-10 11:57:47.387057	2026-09-10 11:57:47.387057
2	2	TP SISTEMAS-4B-DBO	30	Diurna	Aula 201	t	2026-09-10 19:09:10.566607	2026-09-10 19:09:10.566607
3	3	TP SISTEMAS-4C-DBO	30	Diurna	Aula 202	t	2026-09-10 19:09:10.566607	2026-09-10 19:09:10.566607
4	4	TP SISTEMAS-4A-DBO	30	Diurna	Aula 203	t	2026-09-10 19:09:10.566607	2026-09-10 19:09:10.566607
\.


--
-- Data for Name: opciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opciones (id, pregunta_id, contenido, es_correcta, orden, fecha_creacion) FROM stdin;
1	1	El cliente solicita servicios y el servidor los provee, existiendo una separación clara de responsabilidades	t	1	2026-09-10 11:58:36.35688
2	1	Todos los nodos tienen el mismo rol	f	2	2026-09-10 11:58:36.35688
3	1	No requiere red de comunicación	f	3	2026-09-10 11:58:36.35688
4	1	El servidor no puede atender múltiples clientes	f	4	2026-09-10 11:58:36.35688
5	2	La de dos niveles separa cliente y lógica de negocio en tres capas	f	1	2026-09-10 11:58:36.368721
6	2	En la de dos niveles el cliente se comunica directamente con el servidor de datos, mientras que en la de tres niveles se introduce una capa intermedia de lógica de negocio	t	2	2026-09-10 11:58:36.368721
7	2	No hay diferencia entre ambas	f	3	2026-09-10 11:58:36.368721
8	2	La de tres niveles elimina el servidor de base de datos	f	4	2026-09-10 11:58:36.368721
9	3	Procesa las reglas y operaciones del negocio entre la capa de presentación y la de datos	t	1	2026-09-10 11:58:36.369562
10	3	Almacena los datos de forma permanente	f	2	2026-09-10 11:58:36.369562
11	3	Renderiza la interfaz gráfica del cliente	f	3	2026-09-10 11:58:36.369562
12	3	Gestiona la conexión de red física	f	4	2026-09-10 11:58:36.369562
13	4	La organización de carpetas y archivos en el servidor	t	1	2026-09-10 11:58:36.3702
14	4	El menú de navegación visible al usuario	f	2	2026-09-10 11:58:36.3702
15	4	El diseño gráfico de las páginas	f	3	2026-09-10 11:58:36.3702
16	4	El contenido textual de las páginas	f	4	2026-09-10 11:58:36.3702
17	5	La física es cómo se organizan los archivos en el servidor; la lógica es cómo se relacionan y navegan las páginas para el usuario	t	1	2026-09-10 11:58:36.371344
18	5	Son sinónimos y se usan indistintamente	f	2	2026-09-10 11:58:36.371344
19	5	La lógica define únicamente los colores del sitio	f	3	2026-09-10 11:58:36.371344
20	5	La física solo aplica a sitios dinámicos	f	4	2026-09-10 11:58:36.371344
21	6	<div>	f	1	2026-09-10 11:58:36.372083
22	6	<span>	f	2	2026-09-10 11:58:36.372083
23	6	<article>	t	3	2026-09-10 11:58:36.372083
24	6	<b>	f	4	2026-09-10 11:58:36.372083
25	7	El selector de clase (.) puede aplicarse a múltiples elementos, mientras que el de ID (#) debe ser único en el documento	t	1	2026-09-10 11:58:36.372349
26	7	Son idénticos en funcionalidad	f	2	2026-09-10 11:58:36.372349
27	7	El ID se usa solo dentro de formularios	f	3	2026-09-10 11:58:36.372349
28	7	La clase solo puede aplicarse a imágenes	f	4	2026-09-10 11:58:36.372349
29	8	Permitir la captura de datos ingresados por el usuario para enviarlos al servidor	t	1	2026-09-10 11:58:36.372587
30	8	Definir el estilo visual de la página	f	2	2026-09-10 11:58:36.372587
31	8	Establecer la estructura de carpetas del sitio	f	3	2026-09-10 11:58:36.372587
32	8	Cargar archivos multimedia automáticamente	f	4	2026-09-10 11:58:36.372587
129	46	a) esta es	t	\N	2026-09-12 19:55:59.698817
130	46	esta no es	f	\N	2026-09-12 19:55:59.70224
131	46	esta no es	f	\N	2026-09-12 19:55:59.703703
135	49	est es	t	\N	2026-09-13 17:53:34.277389
136	49	esta no	f	\N	2026-09-13 17:53:34.279189
137	49	esta no	f	\N	2026-09-13 17:53:34.279644
140	51	esta es	t	\N	2026-09-13 17:54:06.159976
141	51	esta no	f	\N	2026-09-13 17:54:06.16115
144	54	no	f	\N	2026-09-13 18:11:05.470077
145	54	si	t	\N	2026-09-13 18:11:05.471339
146	54	noo	f	\N	2026-09-13 18:11:05.471949
147	54	nooo	f	\N	2026-09-13 18:11:05.479334
150	56	no	f	\N	2026-09-13 18:11:29.591781
151	56	si	t	\N	2026-09-13 18:11:29.594987
154	58	si	t	\N	2026-09-13 18:11:58.358336
155	58	no	f	\N	2026-09-13 18:11:58.359467
158	60	no	f	\N	2026-09-13 18:12:24.190951
159	60	si	t	\N	2026-09-13 18:12:24.19234
132	48	segunda	t	\N	2026-09-13 17:53:08.118692
133	48	esta no es	f	\N	2026-09-13 17:53:08.121679
134	48	esta tampoco	f	\N	2026-09-13 17:53:08.12232
138	50	esta es	t	\N	2026-09-13 17:53:49.919403
139	50	esta no	f	\N	2026-09-13 17:53:49.920731
142	52	esta es	t	\N	2026-09-13 17:54:23.678724
143	52	esta no	f	\N	2026-09-13 17:54:23.679842
148	55	no	f	\N	2026-09-13 18:11:19.082131
149	55	si	t	\N	2026-09-13 18:11:19.082854
152	57	no	f	\N	2026-09-13 18:11:47.928771
153	57	si	t	\N	2026-09-13 18:11:47.930189
156	59	no	f	\N	2026-09-13 18:12:11.070409
157	59	si	t	\N	2026-09-13 18:12:11.071821
160	61	no	f	\N	2026-09-13 18:12:49.634665
161	61	si	t	\N	2026-09-13 18:12:49.635712
121	43	esta es la opcion correcta	t	\N	2026-09-11 19:33:08.937119
122	43	esta no es correcta	f	\N	2026-09-11 19:33:08.939196
123	43	esta tampoco	f	\N	2026-09-11 19:33:08.939501
124	43	esta tampoco	f	\N	2026-09-11 19:33:08.939828
125	43	aqui se agrego otra opcion	f	\N	2026-09-11 19:33:08.940122
126	43		f	\N	2026-09-11 19:33:08.940477
\.


--
-- Data for Name: preguntas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preguntas (id, evaluacion_id, tipo, enunciado, puntaje, orden, es_obligatoria, explicacion_respuesta, fecha_creacion, fecha_actualizacion) FROM stdin;
1	1	seleccion_multiple	¿Cuál es la característica principal de una arquitectura cliente-servidor?	8.13	1	t	El cliente solicita servicios y el servidor los provee con separación clara de responsabilidades	2026-09-10 11:58:15.687257	2026-09-10 11:58:15.687257
2	1	seleccion_multiple	¿Qué diferencia existe entre una arquitectura de dos niveles y una de tres niveles?	8.13	2	t	La de dos niveles comunica cliente directo con datos; la de tres introduce una capa intermedia de lógica	2026-09-10 11:58:15.687257	2026-09-10 11:58:15.687257
3	1	seleccion_multiple	¿Cuál es la función de la capa de lógica de negocio en una arquitectura de tres niveles?	8.13	3	t	Procesa reglas y operaciones del negocio entre presentación y datos	2026-09-10 11:58:15.687257	2026-09-10 11:58:15.687257
4	1	seleccion_multiple	¿Qué elemento define la estructura física de un sitio web?	8.13	4	t	La organización de carpetas y archivos en el servidor	2026-09-10 11:58:15.687257	2026-09-10 11:58:15.687257
5	1	seleccion_multiple	¿Cuál es la diferencia entre estructura física y estructura lógica de un sitio web?	8.13	5	t	Física: cómo se organizan archivos; Lógica: cómo se relacionan y navegan las páginas	2026-09-10 11:58:15.687257	2026-09-10 11:58:15.687257
6	1	seleccion_multiple	¿Cuál de las siguientes es una etiqueta semántica de HTML5?	8.13	6	t	Las etiquetas semánticas incluyen article, section, nav, header, footer	2026-09-10 11:58:15.687257	2026-09-10 11:58:15.687257
7	1	seleccion_multiple	¿Qué diferencia existe entre un selector de clase y un selector de identificador (ID) en CSS?	8.13	7	t	Clase (.) aplica a múltiples elementos; ID (#) debe ser único en el documento	2026-09-10 11:58:15.687257	2026-09-10 11:58:15.687257
8	1	seleccion_multiple	¿Cuál es el propósito de las etiquetas de formulario en HTML?	8.13	8	t	Capturar datos del usuario para enviarlos al servidor	2026-09-10 11:58:15.687257	2026-09-10 11:58:15.687257
9	1	ensayo	Explique las fases de la metodología de desarrollo de un sitio web, desde la planeación hasta la implementación.	35.00	9	t	Respuesta abierta: evalúa comprensión de fases del desarrollo web	2026-09-10 11:58:15.687257	2026-09-10 11:58:15.687257
10	1	ensayo	Describa la estructura básica de una página web utilizando etiquetas semánticas de HTML5, indicando qué etiquetas debe llevar y en qué orden deben ubicarse dentro del documento.	35.00	10	t	Respuesta abierta: evalúa conocimiento de estructura HTML5 semántica	2026-09-10 11:58:15.687257	2026-09-10 11:58:15.687257
43	12	seleccion_multiple	esta es una pregunta de prueba	\N	2	t	\N	2026-09-11 19:16:58.633771	2026-09-11 19:16:58.633771
46	18	seleccion_multiple	fjklklk	\N	1	t	\N	2026-09-12 19:55:59.679564	2026-09-12 19:55:59.679564
47	18	ensayo	ggghhjj	\N	2	t	\N	2026-09-12 19:56:09.112389	2026-09-12 19:56:09.112389
48	18	seleccion_multiple	segunda	\N	3	t	\N	2026-09-13 17:53:08.072698	2026-09-13 17:53:08.072698
49	18	seleccion_multiple	tercera	\N	4	t	\N	2026-09-13 17:53:34.274221	2026-09-13 17:53:34.274221
50	18	seleccion_multiple	cuarta	\N	5	t	\N	2026-09-13 17:53:49.915896	2026-09-13 17:53:49.915896
51	18	seleccion_multiple	quinta	\N	6	t	\N	2026-09-13 17:54:06.157499	2026-09-13 17:54:06.157499
52	18	seleccion_multiple	quinta	\N	7	t	\N	2026-09-13 17:54:23.660314	2026-09-13 17:54:23.660314
53	18	ensayo	escriba	\N	8	t	\N	2026-09-13 17:54:50.827172	2026-09-13 17:54:50.827172
54	19	seleccion_multiple	primera	\N	1	t	\N	2026-09-13 18:11:05.466431	2026-09-13 18:11:05.466431
55	19	seleccion_multiple	segunda	\N	2	t	\N	2026-09-13 18:11:19.080187	2026-09-13 18:11:19.080187
56	19	seleccion_multiple	tercera	\N	3	t	\N	2026-09-13 18:11:29.58776	2026-09-13 18:11:29.58776
57	19	seleccion_multiple	curta	\N	4	t	\N	2026-09-13 18:11:47.924846	2026-09-13 18:11:47.924846
58	19	seleccion_multiple	quinta	\N	5	t	\N	2026-09-13 18:11:58.356192	2026-09-13 18:11:58.356192
59	19	seleccion_multiple	sexta	\N	6	t	\N	2026-09-13 18:12:11.066958	2026-09-13 18:12:11.066958
60	19	seleccion_multiple	septima	\N	7	t	\N	2026-09-13 18:12:24.18777	2026-09-13 18:12:24.18777
61	19	seleccion_multiple	octava	\N	8	t	\N	2026-09-13 18:12:49.631257	2026-09-13 18:12:49.631257
62	19	ensayo	abierta1	\N	9	t	\N	2026-09-13 18:13:02.22085	2026-09-13 18:13:02.22085
63	19	ensayo	abierta 2	\N	10	t	\N	2026-09-13 18:13:09.574385	2026-09-13 18:13:09.574385
\.


--
-- Data for Name: respuesta_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.respuesta_detalle (id, respuesta_estudiante_id, pregunta_id, respuesta_texto, opcion_seleccionada_id, puntaje_obtenido, retroalimentacion, calificada_manualmente, fecha_calificacion, fecha_creacion) FROM stdin;
56	34	46	130	\N	\N	\N	f	\N	2026-09-13 17:56:26.114802
57	34	47	respuesta	\N	\N	\N	f	\N	2026-09-13 17:56:26.120808
58	34	48	132	\N	\N	\N	f	\N	2026-09-13 17:56:26.121994
59	34	49	135	\N	\N	\N	f	\N	2026-09-13 17:56:26.122704
60	34	50	138	\N	\N	\N	f	\N	2026-09-13 17:56:26.123344
61	34	51	141	\N	\N	\N	f	\N	2026-09-13 17:56:26.123921
62	34	52	142	\N	\N	\N	f	\N	2026-09-13 17:56:26.12472
63	34	53	respuesta 2	\N	\N	\N	f	\N	2026-09-13 17:56:26.125369
64	35	54	145	\N	\N	\N	f	\N	2026-09-13 18:14:05.021497
65	35	55	148	\N	\N	\N	f	\N	2026-09-13 18:14:05.024141
66	35	56	151	\N	\N	\N	f	\N	2026-09-13 18:14:05.02482
67	35	57	153	\N	\N	\N	f	\N	2026-09-13 18:14:05.025511
68	35	58	154	\N	\N	\N	f	\N	2026-09-13 18:14:05.026273
69	35	59	156	\N	\N	\N	f	\N	2026-09-13 18:14:05.027319
70	35	60	158	\N	\N	\N	f	\N	2026-09-13 18:14:05.028442
71	35	61	161	\N	\N	\N	f	\N	2026-09-13 18:14:05.029251
72	35	62	uno	\N	0.50	\N	t	2026-09-13 18:59:50.918224	2026-09-13 18:14:05.029842
73	35	63	dos	\N	0.50	\N	t	2026-09-13 18:59:54.351715	2026-09-13 18:14:05.030368
\.


--
-- Data for Name: respuestas_estudiante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.respuestas_estudiante (id, evaluacion_id, estudiante_id, estado, fecha_inicio, fecha_envio, puntaje_obtenido, porcentaje, intento_numero, fecha_creacion, fecha_actualizacion) FROM stdin;
34	18	3	enviada	\N	\N	\N	\N	1	2026-09-13 17:56:26.103795	2026-09-13 17:56:26.103795
35	19	3	enviada	\N	\N	\N	\N	1	2026-09-13 18:14:05.017801	2026-09-13 18:14:05.017801
\.


--
-- Data for Name: rubricas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rubricas (id, pregunta_id, criterio, puntaje_maximo, descripcion, fecha_creacion) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, email, "contraseña_hash", nombre_completo, apellido, rol, activo, telefono, documento_identidad, fecha_creacion, fecha_actualizacion) FROM stdin;
5	bustos.andres@teinco.edu.co	$2b$10$hash_est3	Andres Felipe	Bustos Marroquin	estudiante	t	3014444446	1110000003	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
6	cardenas.juan@teinco.edu.co	$2b$10$hash_est4	Juan Stevan	Cardenas Gualdron	estudiante	t	3014444447	1110000004	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
7	castillo.jeison@teinco.edu.co	$2b$10$hash_est5	Jeison Esteban	Castillo Castillo	estudiante	t	3014444448	1110000005	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
8	catolico.lizeth@teinco.edu.co	$2b$10$hash_est6	Lizeth Alejandra	Catolico Herrera	estudiante	t	3014444449	1110000006	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
9	chunza.juan@teinco.edu.co	$2b$10$hash_est7	Juan David	Chunza Alfonso	estudiante	t	3014444450	1110000007	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
10	cometa.natalia@teinco.edu.co	$2b$10$hash_est8	Natalia	Cometa Tuta	estudiante	t	3014444451	1110000008	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
11	cupajita.david@teinco.edu.co	$2b$10$hash_est9	David Santiago	Cupajita Buitrago	estudiante	t	3014444452	1110000009	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
12	delgadillo.jean@teinco.edu.co	$2b$10$hash_est10	Jean Paul	Delgadillo Moreno	estudiante	t	3014444453	1110000010	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
13	diaz.diego@teinco.edu.co	$2b$10$hash_est11	Diego Hernando	Diaz Cortes	estudiante	t	3014444454	1110000011	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
14	florez.david@teinco.edu.co	$2b$10$hash_est12	David Santiago	Florez Perilla	estudiante	t	3014444455	1110000012	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
15	forero.juana@teinco.edu.co	$2b$10$hash_est13	Juana Valentina	Forero Fonseca	estudiante	t	3014444456	1110000013	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
16	gonzalez.thomas@teinco.edu.co	$2b$10$hash_est14	Thomas Felipe	Gonzalez Ramirez	estudiante	t	3014444457	1110000014	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
17	gutierrez.alex@teinco.edu.co	$2b$10$hash_est15	Alex Andres	Gutierrez Ramirez	estudiante	t	3014444458	1110000015	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
18	medina.sara@teinco.edu.co	$2b$10$hash_est16	Sara	Medina Correa	estudiante	t	3014444459	1110000016	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
19	molina.melanie@teinco.edu.co	$2b$10$hash_est17	Melanie Shanaia	Molina Mendez	estudiante	t	3014444460	1110000017	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
20	pinilla.dilan@teinco.edu.co	$2b$10$hash_est18	Dilan Stef	Pinilla Prieto	estudiante	t	3014444461	1110000018	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
21	poveda.santiago@teinco.edu.co	$2b$10$hash_est19	Santiago	Poveda Martinez	estudiante	t	3014444462	1110000019	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
22	racero.neil@teinco.edu.co	$2b$10$hash_est20	Neil Ninrod	Racero Gonzalez	estudiante	t	3014444463	1110000020	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
23	ramirez.andres@teinco.edu.co	$2b$10$hash_est21	Andres Felipe	Ramirez Moya	estudiante	t	3014444464	1110000021	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
24	ramirez.jesus@teinco.edu.co	$2b$10$hash_est22	Jesus Daniel	Ramirez Suarez	estudiante	t	3014444465	1110000022	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
25	ramos.juan@teinco.edu.co	$2b$10$hash_est23	Juan Manuel	Ramos Beltran	estudiante	t	3014444466	1110000023	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
26	salcedo.juan@teinco.edu.co	$2b$10$hash_est24	Juan Sebastian	Salcedo Torres	estudiante	t	3014444467	1110000024	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
27	sanchez.johan@teinco.edu.co	$2b$10$hash_est25	Johan Steban	Sanchez Garzon	estudiante	t	3014444468	1110000025	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
28	sanchez.aaron@teinco.edu.co	$2b$10$hash_est26	Aaron	Sanchez Quijada	estudiante	t	3014444469	1110000026	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
29	valbuena.gabriel@teinco.edu.co	$2b$10$hash_est27	Gabriel Alejandro	Valbuena Matuk	estudiante	t	3014444470	1110000027	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
30	villamizar.deiby@teinco.edu.co	$2b$10$hash_est28	Deiby Alexander	Villamizar Perdomo	estudiante	t	3014444471	1110000028	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
31	zambrano.yineth@teinco.edu.co	$2b$10$hash_est29	Yineth Valentina	Zambrano Roa	estudiante	t	3014444472	1110000029	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
33	est002@teinco.edu.co	$2a$10$placeholder2	David Camilo	Garcia Macchi	estudiante	t	3001000002	EST002	2026-09-10 19:09:10.556081	2026-09-10 19:09:10.556081
34	est003@teinco.edu.co	$2a$10$placeholder3	Maria Jose	Muñoz Bautista	estudiante	t	3001000003	EST003	2026-09-10 19:09:10.556081	2026-09-10 19:09:10.556081
35	est004@teinco.edu.co	$2a$10$placeholder4	Andres Leonardo	Penagos Hernandez	estudiante	t	3001000004	EST004	2026-09-10 19:09:10.556081	2026-09-10 19:09:10.556081
36	est005@teinco.edu.co	$2a$10$placeholder5	Juan Esteban	Perez Morales	estudiante	t	3001000005	EST005	2026-09-10 19:09:10.556081	2026-09-10 19:09:10.556081
37	docente@teinco.edu.co	$2a$10$placeholderdocente	Carmen	Milena Herrera	docente	t	\N	\N	2026-09-10 19:09:44.696838	2026-09-10 19:09:44.696838
32	est001@teinco.edu.co	$2b$10$fGdfMR21YQD25PUbRSi7MeNfZyarP30uNkvGWltSHpgFPiOSNIrYW	Daniela	Arias Molano	estudiante	t	3001000001	EST001	2026-09-10 19:09:10.556081	2026-09-10 19:09:10.556081
2	carmen.milena@teinco.edu.co	$2b$10$EMya/aBCWydWsLuAEWj7vej8.DFHRsGNcZocBWiI8jKwH9hczJdsW	Carmen Milena	Herrera	docente	t	3012222222	1055000001	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
3	araujo.juan@teinco.edu.co	$2b$10$MhtU4ITNryHLBYBCywFi1.FW5SlCvlengIAMxETuHRGrCa4L2YYi2	Juan David	Araujo Marquez	estudiante	t	3014444444	1110000001	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
4	botache.juan@teinco.edu.co	$2b$10$Y23XK.TeMsQFpu5sBheNK.CVrIgbzmWyrwI3gqVOH1Uf0KG4wDSpG	Juan Esteban	Botache Huertas	estudiante	t	3014444445	1110000002	2026-09-10 11:57:29.81024	2026-09-10 11:57:29.81024
46	admin@teinco.edu.co	$2b$10$MhtU4ITNryHLBYBCywFi1.FW5SlCvlengIAMxETuHRGrCa4L2YYi2	Admin	Sistema	admin	t	\N	\N	2026-09-11 20:24:55.254664	2026-09-11 20:24:55.254664
47	juan@test.com	$2b$10$bbOvp97mamcnpBDHUfbDfuljpE04yhQZ7SmL1gZnsGiKFVSpJVot2	Juan	Perez	estudiante	t	\N	\N	2026-09-12 09:00:16.64076	2026-09-12 09:00:16.64076
\.


--
-- Name: asignaturas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asignaturas_id_seq', 16, true);


--
-- Name: calificaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.calificaciones_id_seq', 1, false);


--
-- Name: docente_asignatura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.docente_asignatura_id_seq', 12, true);


--
-- Name: estudiante_asignatura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estudiante_asignatura_id_seq', 2, true);


--
-- Name: estudiante_grupo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estudiante_grupo_id_seq', 29, true);


--
-- Name: evaluaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.evaluaciones_id_seq', 19, true);


--
-- Name: exportaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exportaciones_id_seq', 1, false);


--
-- Name: grupos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grupos_id_seq', 7, true);


--
-- Name: opciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.opciones_id_seq', 161, true);


--
-- Name: preguntas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.preguntas_id_seq', 63, true);


--
-- Name: respuesta_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.respuesta_detalle_id_seq', 73, true);


--
-- Name: respuestas_estudiante_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.respuestas_estudiante_id_seq', 35, true);


--
-- Name: rubricas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rubricas_id_seq', 2, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 48, true);


--
-- Name: asignaturas asignaturas_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaturas
    ADD CONSTRAINT asignaturas_codigo_key UNIQUE (codigo);


--
-- Name: asignaturas asignaturas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaturas
    ADD CONSTRAINT asignaturas_pkey PRIMARY KEY (id);


--
-- Name: calificaciones calificaciones_estudiante_id_grupo_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones
    ADD CONSTRAINT calificaciones_estudiante_id_grupo_id_key UNIQUE (estudiante_id, grupo_id);


--
-- Name: calificaciones calificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones
    ADD CONSTRAINT calificaciones_pkey PRIMARY KEY (id);


--
-- Name: docente_asignatura docente_asignatura_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docente_asignatura
    ADD CONSTRAINT docente_asignatura_pkey PRIMARY KEY (id);


--
-- Name: estudiante_asignatura estudiante_asignatura_estudiante_id_asignatura_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante_asignatura
    ADD CONSTRAINT estudiante_asignatura_estudiante_id_asignatura_id_key UNIQUE (estudiante_id, asignatura_id);


--
-- Name: estudiante_asignatura estudiante_asignatura_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante_asignatura
    ADD CONSTRAINT estudiante_asignatura_pkey PRIMARY KEY (id);


--
-- Name: estudiante_grupo estudiante_grupo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante_grupo
    ADD CONSTRAINT estudiante_grupo_pkey PRIMARY KEY (id);


--
-- Name: estudiante_grupo estudiante_grupo_usuario_id_grupo_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante_grupo
    ADD CONSTRAINT estudiante_grupo_usuario_id_grupo_id_key UNIQUE (usuario_id, grupo_id);


--
-- Name: evaluaciones evaluaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_pkey PRIMARY KEY (id);


--
-- Name: exportaciones exportaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exportaciones
    ADD CONSTRAINT exportaciones_pkey PRIMARY KEY (id);


--
-- Name: grupos grupos_asignatura_id_numero_grupo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupos
    ADD CONSTRAINT grupos_asignatura_id_numero_grupo_key UNIQUE (asignatura_id, numero_grupo);


--
-- Name: grupos grupos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupos
    ADD CONSTRAINT grupos_pkey PRIMARY KEY (id);


--
-- Name: opciones opciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opciones
    ADD CONSTRAINT opciones_pkey PRIMARY KEY (id);


--
-- Name: opciones opciones_pregunta_id_orden_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opciones
    ADD CONSTRAINT opciones_pregunta_id_orden_key UNIQUE (pregunta_id, orden);


--
-- Name: preguntas preguntas_evaluacion_id_orden_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas
    ADD CONSTRAINT preguntas_evaluacion_id_orden_key UNIQUE (evaluacion_id, orden);


--
-- Name: preguntas preguntas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas
    ADD CONSTRAINT preguntas_pkey PRIMARY KEY (id);


--
-- Name: respuesta_detalle respuesta_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respuesta_detalle
    ADD CONSTRAINT respuesta_detalle_pkey PRIMARY KEY (id);


--
-- Name: respuesta_detalle respuesta_detalle_respuesta_estudiante_id_pregunta_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respuesta_detalle
    ADD CONSTRAINT respuesta_detalle_respuesta_estudiante_id_pregunta_id_key UNIQUE (respuesta_estudiante_id, pregunta_id);


--
-- Name: respuestas_estudiante respuestas_estudiante_evaluacion_id_estudiante_id_intento_n_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respuestas_estudiante
    ADD CONSTRAINT respuestas_estudiante_evaluacion_id_estudiante_id_intento_n_key UNIQUE (evaluacion_id, estudiante_id, intento_numero);


--
-- Name: respuestas_estudiante respuestas_estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respuestas_estudiante
    ADD CONSTRAINT respuestas_estudiante_pkey PRIMARY KEY (id);


--
-- Name: rubricas rubricas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rubricas
    ADD CONSTRAINT rubricas_pkey PRIMARY KEY (id);


--
-- Name: rubricas rubricas_pregunta_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rubricas
    ADD CONSTRAINT rubricas_pregunta_id_key UNIQUE (pregunta_id);


--
-- Name: usuarios usuarios_documento_identidad_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_documento_identidad_key UNIQUE (documento_identidad);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_asignaturas_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asignaturas_codigo ON public.asignaturas USING btree (codigo);


--
-- Name: idx_calificaciones_estudiante; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calificaciones_estudiante ON public.calificaciones USING btree (estudiante_id);


--
-- Name: idx_calificaciones_grupo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calificaciones_grupo ON public.calificaciones USING btree (grupo_id);


--
-- Name: idx_docente_asignatura_grupo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_docente_asignatura_grupo ON public.docente_asignatura USING btree (grupo_id);


--
-- Name: idx_docente_asignatura_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_docente_asignatura_usuario ON public.docente_asignatura USING btree (usuario_id);


--
-- Name: idx_estudiante_grupo_grupo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_estudiante_grupo_grupo ON public.estudiante_grupo USING btree (grupo_id);


--
-- Name: idx_estudiante_grupo_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_estudiante_grupo_usuario ON public.estudiante_grupo USING btree (usuario_id);


--
-- Name: idx_evaluaciones_docente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evaluaciones_docente ON public.evaluaciones USING btree (docente_id);


--
-- Name: idx_evaluaciones_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evaluaciones_estado ON public.evaluaciones USING btree (estado);


--
-- Name: idx_evaluaciones_grupo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_evaluaciones_grupo ON public.evaluaciones USING btree (grupo_id);


--
-- Name: idx_exportaciones_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_exportaciones_fecha ON public.exportaciones USING btree (fecha_exportacion);


--
-- Name: idx_exportaciones_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_exportaciones_usuario ON public.exportaciones USING btree (usuario_id);


--
-- Name: idx_grupos_asignatura; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grupos_asignatura ON public.grupos USING btree (asignatura_id);


--
-- Name: idx_opciones_pregunta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_opciones_pregunta ON public.opciones USING btree (pregunta_id);


--
-- Name: idx_preguntas_evaluacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_preguntas_evaluacion ON public.preguntas USING btree (evaluacion_id);


--
-- Name: idx_respuesta_detalle_pregunta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_respuesta_detalle_pregunta ON public.respuesta_detalle USING btree (pregunta_id);


--
-- Name: idx_respuesta_detalle_respuesta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_respuesta_detalle_respuesta ON public.respuesta_detalle USING btree (respuesta_estudiante_id);


--
-- Name: idx_respuestas_estudiante_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_respuestas_estudiante_estado ON public.respuestas_estudiante USING btree (estado);


--
-- Name: idx_respuestas_estudiante_estudiante; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_respuestas_estudiante_estudiante ON public.respuestas_estudiante USING btree (estudiante_id);


--
-- Name: idx_respuestas_estudiante_evaluacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_respuestas_estudiante_evaluacion ON public.respuestas_estudiante USING btree (evaluacion_id);


--
-- Name: idx_rubricas_pregunta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rubricas_pregunta ON public.rubricas USING btree (pregunta_id);


--
-- Name: idx_usuarios_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_email ON public.usuarios USING btree (email);


--
-- Name: idx_usuarios_rol; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_rol ON public.usuarios USING btree (rol);


--
-- Name: calificaciones calificaciones_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones
    ADD CONSTRAINT calificaciones_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: calificaciones calificaciones_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones
    ADD CONSTRAINT calificaciones_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE CASCADE;


--
-- Name: docente_asignatura docente_asignatura_asignatura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docente_asignatura
    ADD CONSTRAINT docente_asignatura_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id) ON DELETE CASCADE;


--
-- Name: docente_asignatura docente_asignatura_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docente_asignatura
    ADD CONSTRAINT docente_asignatura_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE CASCADE;


--
-- Name: docente_asignatura docente_asignatura_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docente_asignatura
    ADD CONSTRAINT docente_asignatura_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: estudiante_asignatura estudiante_asignatura_asignatura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante_asignatura
    ADD CONSTRAINT estudiante_asignatura_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id) ON DELETE CASCADE;


--
-- Name: estudiante_asignatura estudiante_asignatura_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante_asignatura
    ADD CONSTRAINT estudiante_asignatura_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: estudiante_grupo estudiante_grupo_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante_grupo
    ADD CONSTRAINT estudiante_grupo_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE CASCADE;


--
-- Name: estudiante_grupo estudiante_grupo_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante_grupo
    ADD CONSTRAINT estudiante_grupo_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: evaluaciones evaluaciones_asignatura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id) ON DELETE CASCADE;


--
-- Name: evaluaciones evaluaciones_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: evaluaciones evaluaciones_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE CASCADE;


--
-- Name: exportaciones exportaciones_asignatura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exportaciones
    ADD CONSTRAINT exportaciones_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id) ON DELETE SET NULL;


--
-- Name: exportaciones exportaciones_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exportaciones
    ADD CONSTRAINT exportaciones_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE SET NULL;


--
-- Name: exportaciones exportaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exportaciones
    ADD CONSTRAINT exportaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: grupos grupos_asignatura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupos
    ADD CONSTRAINT grupos_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id) ON DELETE CASCADE;


--
-- Name: opciones opciones_pregunta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opciones
    ADD CONSTRAINT opciones_pregunta_id_fkey FOREIGN KEY (pregunta_id) REFERENCES public.preguntas(id) ON DELETE CASCADE;


--
-- Name: preguntas preguntas_evaluacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas
    ADD CONSTRAINT preguntas_evaluacion_id_fkey FOREIGN KEY (evaluacion_id) REFERENCES public.evaluaciones(id) ON DELETE CASCADE;


--
-- Name: respuesta_detalle respuesta_detalle_opcion_seleccionada_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respuesta_detalle
    ADD CONSTRAINT respuesta_detalle_opcion_seleccionada_id_fkey FOREIGN KEY (opcion_seleccionada_id) REFERENCES public.opciones(id) ON DELETE SET NULL;


--
-- Name: respuesta_detalle respuesta_detalle_pregunta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respuesta_detalle
    ADD CONSTRAINT respuesta_detalle_pregunta_id_fkey FOREIGN KEY (pregunta_id) REFERENCES public.preguntas(id) ON DELETE CASCADE;


--
-- Name: respuesta_detalle respuesta_detalle_respuesta_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respuesta_detalle
    ADD CONSTRAINT respuesta_detalle_respuesta_estudiante_id_fkey FOREIGN KEY (respuesta_estudiante_id) REFERENCES public.respuestas_estudiante(id) ON DELETE CASCADE;


--
-- Name: respuestas_estudiante respuestas_estudiante_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respuestas_estudiante
    ADD CONSTRAINT respuestas_estudiante_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: respuestas_estudiante respuestas_estudiante_evaluacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respuestas_estudiante
    ADD CONSTRAINT respuestas_estudiante_evaluacion_id_fkey FOREIGN KEY (evaluacion_id) REFERENCES public.evaluaciones(id) ON DELETE CASCADE;


--
-- Name: rubricas rubricas_pregunta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rubricas
    ADD CONSTRAINT rubricas_pregunta_id_fkey FOREIGN KEY (pregunta_id) REFERENCES public.preguntas(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


