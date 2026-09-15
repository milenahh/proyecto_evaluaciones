--
-- PostgreSQL database dump
--

\restrict Zlt2Zalby5P65p17sNS3ekGyQdWHcOkeRXobeHoo0qA6RkjyHL2ee6gmFetQMA6

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
-- Name: estado_evaluacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_evaluacion AS ENUM (
    'borrador',
    'publicada',
    'cerrada',
    'archivada'
);


--
-- Name: estado_respuesta; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_respuesta AS ENUM (
    'no_iniciada',
    'en_progreso',
    'enviada',
    'calificada'
);


--
-- Name: rol_usuario; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.rol_usuario AS ENUM (
    'admin',
    'docente',
    'estudiante'
);


--
-- Name: tipo_calificacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_calificacion AS ENUM (
    'automatica',
    'manual',
    'hibrida'
);


--
-- Name: tipo_pregunta; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_pregunta AS ENUM (
    'seleccion_multiple',
    'verdadero_falso',
    'respuesta_corta',
    'ensayo',
    'pareo'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asignaturas; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: asignaturas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asignaturas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asignaturas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asignaturas_id_seq OWNED BY public.asignaturas.id;


--
-- Name: calificaciones; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: calificaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.calificaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: calificaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.calificaciones_id_seq OWNED BY public.calificaciones.id;


--
-- Name: docente_asignatura; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: docente_asignatura_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.docente_asignatura_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: docente_asignatura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.docente_asignatura_id_seq OWNED BY public.docente_asignatura.id;


--
-- Name: estudiante_asignatura; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estudiante_asignatura (
    id integer NOT NULL,
    estudiante_id integer NOT NULL,
    asignatura_id integer NOT NULL
);


--
-- Name: estudiante_asignatura_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estudiante_asignatura_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: estudiante_asignatura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estudiante_asignatura_id_seq OWNED BY public.estudiante_asignatura.id;


--
-- Name: estudiante_grupo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estudiante_grupo (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    grupo_id integer NOT NULL,
    fecha_inscripcion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    activo boolean DEFAULT true
);


--
-- Name: estudiante_grupo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estudiante_grupo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: estudiante_grupo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estudiante_grupo_id_seq OWNED BY public.estudiante_grupo.id;


--
-- Name: evaluaciones; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: evaluaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.evaluaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: evaluaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.evaluaciones_id_seq OWNED BY public.evaluaciones.id;


--
-- Name: exportaciones; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: exportaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exportaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exportaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exportaciones_id_seq OWNED BY public.exportaciones.id;


--
-- Name: grupos; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: grupos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grupos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grupos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grupos_id_seq OWNED BY public.grupos.id;


--
-- Name: opciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.opciones (
    id integer NOT NULL,
    pregunta_id integer NOT NULL,
    contenido text NOT NULL,
    es_correcta boolean DEFAULT false,
    orden integer,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: opciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.opciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: opciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.opciones_id_seq OWNED BY public.opciones.id;


--
-- Name: preguntas; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: preguntas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.preguntas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: preguntas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.preguntas_id_seq OWNED BY public.preguntas.id;


--
-- Name: respuesta_detalle; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: respuesta_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.respuesta_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: respuesta_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.respuesta_detalle_id_seq OWNED BY public.respuesta_detalle.id;


--
-- Name: respuestas_estudiante; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: respuestas_estudiante_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.respuestas_estudiante_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: respuestas_estudiante_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.respuestas_estudiante_id_seq OWNED BY public.respuestas_estudiante.id;


--
-- Name: rubricas; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: rubricas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rubricas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rubricas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rubricas_id_seq OWNED BY public.rubricas.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: asignaturas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignaturas ALTER COLUMN id SET DEFAULT nextval('public.asignaturas_id_seq'::regclass);


--
-- Name: calificaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calificaciones ALTER COLUMN id SET DEFAULT nextval('public.calificaciones_id_seq'::regclass);


--
-- Name: docente_asignatura id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente_asignatura ALTER COLUMN id SET DEFAULT nextval('public.docente_asignatura_id_seq'::regclass);


--
-- Name: estudiante_asignatura id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estudiante_asignatura ALTER COLUMN id SET DEFAULT nextval('public.estudiante_asignatura_id_seq'::regclass);


--
-- Name: estudiante_grupo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estudiante_grupo ALTER COLUMN id SET DEFAULT nextval('public.estudiante_grupo_id_seq'::regclass);


--
-- Name: evaluaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones ALTER COLUMN id SET DEFAULT nextval('public.evaluaciones_id_seq'::regclass);


--
-- Name: exportaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exportaciones ALTER COLUMN id SET DEFAULT nextval('public.exportaciones_id_seq'::regclass);


--
-- Name: grupos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grupos ALTER COLUMN id SET DEFAULT nextval('public.grupos_id_seq'::regclass);


--
-- Name: opciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opciones ALTER COLUMN id SET DEFAULT nextval('public.opciones_id_seq'::regclass);


--
-- Name: preguntas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preguntas ALTER COLUMN id SET DEFAULT nextval('public.preguntas_id_seq'::regclass);


--
-- Name: respuesta_detalle id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuesta_detalle ALTER COLUMN id SET DEFAULT nextval('public.respuesta_detalle_id_seq'::regclass);


--
-- Name: respuestas_estudiante id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuestas_estudiante ALTER COLUMN id SET DEFAULT nextval('public.respuestas_estudiante_id_seq'::regclass);


--
-- Name: rubricas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubricas ALTER COLUMN id SET DEFAULT nextval('public.rubricas_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: asignaturas; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.asignaturas VALUES (1, 'PROG-WEB-N', 'Programación Web', 'Desarrollo web con arquitecturas cliente-servidor, HTML5, CSS3 y JavaScript', 4, 4, true, '2026-09-10 11:57:47.373216', '2026-09-10 11:57:47.373216');
INSERT INTO public.asignaturas VALUES (2, 'GAC-F10-01', 'Administración de Bases de Datos', 'Gestión de SMBD', 3, 4, true, '2026-09-10 19:08:41.072345', '2026-09-10 19:08:41.072345');
INSERT INTO public.asignaturas VALUES (3, 'GAC-F10-02', 'Administración Web', 'Servicios web DNS HTTP FTP DHCP', 3, 3, true, '2026-09-10 19:08:41.072345', '2026-09-10 19:08:41.072345');
INSERT INTO public.asignaturas VALUES (4, 'GAC-F10-03', 'Principios y Desarrollo de Software', 'Ciclo de vida y metodologías', 3, 2, true, '2026-09-10 19:08:41.072345', '2026-09-10 19:08:41.072345');
INSERT INTO public.asignaturas VALUES (16, '12345', 'nueva ', NULL, 3, 1, true, '2026-09-12 14:18:37.60385', '2026-09-12 14:18:37.60385');


--
-- Data for Name: calificaciones; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: docente_asignatura; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.docente_asignatura VALUES (1, 2, 1, 1, '2026-08-05', NULL, true, '2026-09-10 11:57:47.413045');
INSERT INTO public.docente_asignatura VALUES (4, 2, 2, 1, '2026-09-11', NULL, true, '2026-09-11 18:52:11.226671');
INSERT INTO public.docente_asignatura VALUES (5, 2, 3, 1, '2026-09-11', NULL, true, '2026-09-11 18:52:11.226671');
INSERT INTO public.docente_asignatura VALUES (6, 2, 4, 1, '2026-09-11', NULL, true, '2026-09-11 18:52:11.226671');
INSERT INTO public.docente_asignatura VALUES (11, 2, 1, NULL, NULL, NULL, true, '2026-09-12 14:21:20.90862');
INSERT INTO public.docente_asignatura VALUES (12, 2, 16, NULL, NULL, NULL, true, '2026-09-12 14:21:50.471082');


--
-- Data for Name: estudiante_asignatura; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.estudiante_asignatura VALUES (1, 3, 1);
INSERT INTO public.estudiante_asignatura VALUES (2, 3, 16);


--
-- Data for Name: estudiante_grupo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.estudiante_grupo VALUES (1, 3, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (2, 4, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (3, 5, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (4, 6, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (5, 7, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (6, 8, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (7, 9, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (8, 10, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (9, 11, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (10, 12, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (11, 13, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (12, 14, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (13, 15, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (14, 16, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (15, 17, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (16, 18, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (17, 19, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (18, 20, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (19, 21, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (20, 22, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (21, 23, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (22, 24, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (23, 25, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (24, 26, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (25, 27, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (26, 28, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (27, 29, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (28, 30, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);
INSERT INTO public.estudiante_grupo VALUES (29, 31, 1, '2026-09-10 11:57:47.423205', '2026-09-10 11:57:47.423205', true);


--
-- Data for Name: evaluaciones; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.evaluaciones VALUES (1, 1, 2, 'Parcial 1: Fundamentos de Programación Web', 'Evaluación de conceptos de arquitecturas web, HTML5 y CSS', 'hibrida', 100.00, 'publicada', '2026-09-11 09:00:00', '2026-09-11 11:00:00', 60, 1, false, true, '2026-09-10 11:57:59.317034', '2026-09-10 11:57:59.317034', NULL, NULL, NULL);
INSERT INTO public.evaluaciones VALUES (12, NULL, 2, 'PARCIAL 1-B', 'hjk', 'automatica', 100.00, 'borrador', NULL, NULL, 60, 1, false, false, '2026-09-11 19:06:21.278836', '2026-09-11 19:06:21.278836', NULL, NULL, NULL);
INSERT INTO public.evaluaciones VALUES (18, NULL, 2, 'prueba parcial', 'contrasena', 'automatica', 100.00, 'borrador', '2026-09-12 10:58:00', '2026-09-15 10:58:00', 60, 1, false, false, '2026-09-12 18:59:02.391038', '2026-09-12 18:59:02.391038', 1, NULL, '$2b$10$zJF6dDG0UBPFc3shFM3EeuZlcEpzbzEffE5fmtqS9iTZpJ11Gkghe');
INSERT INTO public.evaluaciones VALUES (19, NULL, 2, 'fundamentos prueb', 'parcial prueba 2', 'automatica', 50.00, 'borrador', '2026-09-12 18:10:00', '2026-09-14 18:10:00', 60, 1, false, false, '2026-09-13 18:10:29.841401', '2026-09-13 18:10:29.841401', 1, NULL, '$2b$10$v.jDwUZ8/QRdKgxJrexqdOPJO6A5145BSTU2SYUr8iwrz71Xq63uu');


--
-- Data for Name: exportaciones; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: grupos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.grupos VALUES (1, 1, 'TP SISTEMAS-4A-DBO', 30, 'Diurna', 'D301', true, '2026-09-10 11:57:47.387057', '2026-09-10 11:57:47.387057');
INSERT INTO public.grupos VALUES (2, 2, 'TP SISTEMAS-4B-DBO', 30, 'Diurna', 'Aula 201', true, '2026-09-10 19:09:10.566607', '2026-09-10 19:09:10.566607');
INSERT INTO public.grupos VALUES (3, 3, 'TP SISTEMAS-4C-DBO', 30, 'Diurna', 'Aula 202', true, '2026-09-10 19:09:10.566607', '2026-09-10 19:09:10.566607');
INSERT INTO public.grupos VALUES (4, 4, 'TP SISTEMAS-4A-DBO', 30, 'Diurna', 'Aula 203', true, '2026-09-10 19:09:10.566607', '2026-09-10 19:09:10.566607');


--
-- Data for Name: opciones; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.opciones VALUES (1, 1, 'El cliente solicita servicios y el servidor los provee, existiendo una separación clara de responsabilidades', true, 1, '2026-09-10 11:58:36.35688');
INSERT INTO public.opciones VALUES (2, 1, 'Todos los nodos tienen el mismo rol', false, 2, '2026-09-10 11:58:36.35688');
INSERT INTO public.opciones VALUES (3, 1, 'No requiere red de comunicación', false, 3, '2026-09-10 11:58:36.35688');
INSERT INTO public.opciones VALUES (4, 1, 'El servidor no puede atender múltiples clientes', false, 4, '2026-09-10 11:58:36.35688');
INSERT INTO public.opciones VALUES (5, 2, 'La de dos niveles separa cliente y lógica de negocio en tres capas', false, 1, '2026-09-10 11:58:36.368721');
INSERT INTO public.opciones VALUES (6, 2, 'En la de dos niveles el cliente se comunica directamente con el servidor de datos, mientras que en la de tres niveles se introduce una capa intermedia de lógica de negocio', true, 2, '2026-09-10 11:58:36.368721');
INSERT INTO public.opciones VALUES (7, 2, 'No hay diferencia entre ambas', false, 3, '2026-09-10 11:58:36.368721');
INSERT INTO public.opciones VALUES (8, 2, 'La de tres niveles elimina el servidor de base de datos', false, 4, '2026-09-10 11:58:36.368721');
INSERT INTO public.opciones VALUES (9, 3, 'Procesa las reglas y operaciones del negocio entre la capa de presentación y la de datos', true, 1, '2026-09-10 11:58:36.369562');
INSERT INTO public.opciones VALUES (10, 3, 'Almacena los datos de forma permanente', false, 2, '2026-09-10 11:58:36.369562');
INSERT INTO public.opciones VALUES (11, 3, 'Renderiza la interfaz gráfica del cliente', false, 3, '2026-09-10 11:58:36.369562');
INSERT INTO public.opciones VALUES (12, 3, 'Gestiona la conexión de red física', false, 4, '2026-09-10 11:58:36.369562');
INSERT INTO public.opciones VALUES (13, 4, 'La organización de carpetas y archivos en el servidor', true, 1, '2026-09-10 11:58:36.3702');
INSERT INTO public.opciones VALUES (14, 4, 'El menú de navegación visible al usuario', false, 2, '2026-09-10 11:58:36.3702');
INSERT INTO public.opciones VALUES (15, 4, 'El diseño gráfico de las páginas', false, 3, '2026-09-10 11:58:36.3702');
INSERT INTO public.opciones VALUES (16, 4, 'El contenido textual de las páginas', false, 4, '2026-09-10 11:58:36.3702');
INSERT INTO public.opciones VALUES (17, 5, 'La física es cómo se organizan los archivos en el servidor; la lógica es cómo se relacionan y navegan las páginas para el usuario', true, 1, '2026-09-10 11:58:36.371344');
INSERT INTO public.opciones VALUES (18, 5, 'Son sinónimos y se usan indistintamente', false, 2, '2026-09-10 11:58:36.371344');
INSERT INTO public.opciones VALUES (19, 5, 'La lógica define únicamente los colores del sitio', false, 3, '2026-09-10 11:58:36.371344');
INSERT INTO public.opciones VALUES (20, 5, 'La física solo aplica a sitios dinámicos', false, 4, '2026-09-10 11:58:36.371344');
INSERT INTO public.opciones VALUES (21, 6, '<div>', false, 1, '2026-09-10 11:58:36.372083');
INSERT INTO public.opciones VALUES (22, 6, '<span>', false, 2, '2026-09-10 11:58:36.372083');
INSERT INTO public.opciones VALUES (23, 6, '<article>', true, 3, '2026-09-10 11:58:36.372083');
INSERT INTO public.opciones VALUES (24, 6, '<b>', false, 4, '2026-09-10 11:58:36.372083');
INSERT INTO public.opciones VALUES (25, 7, 'El selector de clase (.) puede aplicarse a múltiples elementos, mientras que el de ID (#) debe ser único en el documento', true, 1, '2026-09-10 11:58:36.372349');
INSERT INTO public.opciones VALUES (26, 7, 'Son idénticos en funcionalidad', false, 2, '2026-09-10 11:58:36.372349');
INSERT INTO public.opciones VALUES (27, 7, 'El ID se usa solo dentro de formularios', false, 3, '2026-09-10 11:58:36.372349');
INSERT INTO public.opciones VALUES (28, 7, 'La clase solo puede aplicarse a imágenes', false, 4, '2026-09-10 11:58:36.372349');
INSERT INTO public.opciones VALUES (29, 8, 'Permitir la captura de datos ingresados por el usuario para enviarlos al servidor', true, 1, '2026-09-10 11:58:36.372587');
INSERT INTO public.opciones VALUES (30, 8, 'Definir el estilo visual de la página', false, 2, '2026-09-10 11:58:36.372587');
INSERT INTO public.opciones VALUES (31, 8, 'Establecer la estructura de carpetas del sitio', false, 3, '2026-09-10 11:58:36.372587');
INSERT INTO public.opciones VALUES (32, 8, 'Cargar archivos multimedia automáticamente', false, 4, '2026-09-10 11:58:36.372587');
INSERT INTO public.opciones VALUES (129, 46, 'a) esta es', true, NULL, '2026-09-12 19:55:59.698817');
INSERT INTO public.opciones VALUES (130, 46, 'esta no es', false, NULL, '2026-09-12 19:55:59.70224');
INSERT INTO public.opciones VALUES (131, 46, 'esta no es', false, NULL, '2026-09-12 19:55:59.703703');
INSERT INTO public.opciones VALUES (135, 49, 'est es', true, NULL, '2026-09-13 17:53:34.277389');
INSERT INTO public.opciones VALUES (136, 49, 'esta no', false, NULL, '2026-09-13 17:53:34.279189');
INSERT INTO public.opciones VALUES (137, 49, 'esta no', false, NULL, '2026-09-13 17:53:34.279644');
INSERT INTO public.opciones VALUES (140, 51, 'esta es', true, NULL, '2026-09-13 17:54:06.159976');
INSERT INTO public.opciones VALUES (141, 51, 'esta no', false, NULL, '2026-09-13 17:54:06.16115');
INSERT INTO public.opciones VALUES (144, 54, 'no', false, NULL, '2026-09-13 18:11:05.470077');
INSERT INTO public.opciones VALUES (145, 54, 'si', true, NULL, '2026-09-13 18:11:05.471339');
INSERT INTO public.opciones VALUES (146, 54, 'noo', false, NULL, '2026-09-13 18:11:05.471949');
INSERT INTO public.opciones VALUES (147, 54, 'nooo', false, NULL, '2026-09-13 18:11:05.479334');
INSERT INTO public.opciones VALUES (150, 56, 'no', false, NULL, '2026-09-13 18:11:29.591781');
INSERT INTO public.opciones VALUES (151, 56, 'si', true, NULL, '2026-09-13 18:11:29.594987');
INSERT INTO public.opciones VALUES (154, 58, 'si', true, NULL, '2026-09-13 18:11:58.358336');
INSERT INTO public.opciones VALUES (155, 58, 'no', false, NULL, '2026-09-13 18:11:58.359467');
INSERT INTO public.opciones VALUES (158, 60, 'no', false, NULL, '2026-09-13 18:12:24.190951');
INSERT INTO public.opciones VALUES (159, 60, 'si', true, NULL, '2026-09-13 18:12:24.19234');
INSERT INTO public.opciones VALUES (132, 48, 'segunda', true, NULL, '2026-09-13 17:53:08.118692');
INSERT INTO public.opciones VALUES (133, 48, 'esta no es', false, NULL, '2026-09-13 17:53:08.121679');
INSERT INTO public.opciones VALUES (134, 48, 'esta tampoco', false, NULL, '2026-09-13 17:53:08.12232');
INSERT INTO public.opciones VALUES (138, 50, 'esta es', true, NULL, '2026-09-13 17:53:49.919403');
INSERT INTO public.opciones VALUES (139, 50, 'esta no', false, NULL, '2026-09-13 17:53:49.920731');
INSERT INTO public.opciones VALUES (142, 52, 'esta es', true, NULL, '2026-09-13 17:54:23.678724');
INSERT INTO public.opciones VALUES (143, 52, 'esta no', false, NULL, '2026-09-13 17:54:23.679842');
INSERT INTO public.opciones VALUES (148, 55, 'no', false, NULL, '2026-09-13 18:11:19.082131');
INSERT INTO public.opciones VALUES (149, 55, 'si', true, NULL, '2026-09-13 18:11:19.082854');
INSERT INTO public.opciones VALUES (152, 57, 'no', false, NULL, '2026-09-13 18:11:47.928771');
INSERT INTO public.opciones VALUES (153, 57, 'si', true, NULL, '2026-09-13 18:11:47.930189');
INSERT INTO public.opciones VALUES (156, 59, 'no', false, NULL, '2026-09-13 18:12:11.070409');
INSERT INTO public.opciones VALUES (157, 59, 'si', true, NULL, '2026-09-13 18:12:11.071821');
INSERT INTO public.opciones VALUES (160, 61, 'no', false, NULL, '2026-09-13 18:12:49.634665');
INSERT INTO public.opciones VALUES (161, 61, 'si', true, NULL, '2026-09-13 18:12:49.635712');
INSERT INTO public.opciones VALUES (121, 43, 'esta es la opcion correcta', true, NULL, '2026-09-11 19:33:08.937119');
INSERT INTO public.opciones VALUES (122, 43, 'esta no es correcta', false, NULL, '2026-09-11 19:33:08.939196');
INSERT INTO public.opciones VALUES (123, 43, 'esta tampoco', false, NULL, '2026-09-11 19:33:08.939501');
INSERT INTO public.opciones VALUES (124, 43, 'esta tampoco', false, NULL, '2026-09-11 19:33:08.939828');
INSERT INTO public.opciones VALUES (125, 43, 'aqui se agrego otra opcion', false, NULL, '2026-09-11 19:33:08.940122');
INSERT INTO public.opciones VALUES (126, 43, '', false, NULL, '2026-09-11 19:33:08.940477');


--
-- Data for Name: preguntas; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.preguntas VALUES (1, 1, 'seleccion_multiple', '¿Cuál es la característica principal de una arquitectura cliente-servidor?', 8.13, 1, true, 'El cliente solicita servicios y el servidor los provee con separación clara de responsabilidades', '2026-09-10 11:58:15.687257', '2026-09-10 11:58:15.687257');
INSERT INTO public.preguntas VALUES (2, 1, 'seleccion_multiple', '¿Qué diferencia existe entre una arquitectura de dos niveles y una de tres niveles?', 8.13, 2, true, 'La de dos niveles comunica cliente directo con datos; la de tres introduce una capa intermedia de lógica', '2026-09-10 11:58:15.687257', '2026-09-10 11:58:15.687257');
INSERT INTO public.preguntas VALUES (3, 1, 'seleccion_multiple', '¿Cuál es la función de la capa de lógica de negocio en una arquitectura de tres niveles?', 8.13, 3, true, 'Procesa reglas y operaciones del negocio entre presentación y datos', '2026-09-10 11:58:15.687257', '2026-09-10 11:58:15.687257');
INSERT INTO public.preguntas VALUES (4, 1, 'seleccion_multiple', '¿Qué elemento define la estructura física de un sitio web?', 8.13, 4, true, 'La organización de carpetas y archivos en el servidor', '2026-09-10 11:58:15.687257', '2026-09-10 11:58:15.687257');
INSERT INTO public.preguntas VALUES (5, 1, 'seleccion_multiple', '¿Cuál es la diferencia entre estructura física y estructura lógica de un sitio web?', 8.13, 5, true, 'Física: cómo se organizan archivos; Lógica: cómo se relacionan y navegan las páginas', '2026-09-10 11:58:15.687257', '2026-09-10 11:58:15.687257');
INSERT INTO public.preguntas VALUES (6, 1, 'seleccion_multiple', '¿Cuál de las siguientes es una etiqueta semántica de HTML5?', 8.13, 6, true, 'Las etiquetas semánticas incluyen article, section, nav, header, footer', '2026-09-10 11:58:15.687257', '2026-09-10 11:58:15.687257');
INSERT INTO public.preguntas VALUES (7, 1, 'seleccion_multiple', '¿Qué diferencia existe entre un selector de clase y un selector de identificador (ID) en CSS?', 8.13, 7, true, 'Clase (.) aplica a múltiples elementos; ID (#) debe ser único en el documento', '2026-09-10 11:58:15.687257', '2026-09-10 11:58:15.687257');
INSERT INTO public.preguntas VALUES (8, 1, 'seleccion_multiple', '¿Cuál es el propósito de las etiquetas de formulario en HTML?', 8.13, 8, true, 'Capturar datos del usuario para enviarlos al servidor', '2026-09-10 11:58:15.687257', '2026-09-10 11:58:15.687257');
INSERT INTO public.preguntas VALUES (9, 1, 'ensayo', 'Explique las fases de la metodología de desarrollo de un sitio web, desde la planeación hasta la implementación.', 35.00, 9, true, 'Respuesta abierta: evalúa comprensión de fases del desarrollo web', '2026-09-10 11:58:15.687257', '2026-09-10 11:58:15.687257');
INSERT INTO public.preguntas VALUES (10, 1, 'ensayo', 'Describa la estructura básica de una página web utilizando etiquetas semánticas de HTML5, indicando qué etiquetas debe llevar y en qué orden deben ubicarse dentro del documento.', 35.00, 10, true, 'Respuesta abierta: evalúa conocimiento de estructura HTML5 semántica', '2026-09-10 11:58:15.687257', '2026-09-10 11:58:15.687257');
INSERT INTO public.preguntas VALUES (43, 12, 'seleccion_multiple', 'esta es una pregunta de prueba', NULL, 2, true, NULL, '2026-09-11 19:16:58.633771', '2026-09-11 19:16:58.633771');
INSERT INTO public.preguntas VALUES (46, 18, 'seleccion_multiple', 'fjklklk', NULL, 1, true, NULL, '2026-09-12 19:55:59.679564', '2026-09-12 19:55:59.679564');
INSERT INTO public.preguntas VALUES (47, 18, 'ensayo', 'ggghhjj', NULL, 2, true, NULL, '2026-09-12 19:56:09.112389', '2026-09-12 19:56:09.112389');
INSERT INTO public.preguntas VALUES (48, 18, 'seleccion_multiple', 'segunda', NULL, 3, true, NULL, '2026-09-13 17:53:08.072698', '2026-09-13 17:53:08.072698');
INSERT INTO public.preguntas VALUES (49, 18, 'seleccion_multiple', 'tercera', NULL, 4, true, NULL, '2026-09-13 17:53:34.274221', '2026-09-13 17:53:34.274221');
INSERT INTO public.preguntas VALUES (50, 18, 'seleccion_multiple', 'cuarta', NULL, 5, true, NULL, '2026-09-13 17:53:49.915896', '2026-09-13 17:53:49.915896');
INSERT INTO public.preguntas VALUES (51, 18, 'seleccion_multiple', 'quinta', NULL, 6, true, NULL, '2026-09-13 17:54:06.157499', '2026-09-13 17:54:06.157499');
INSERT INTO public.preguntas VALUES (52, 18, 'seleccion_multiple', 'quinta', NULL, 7, true, NULL, '2026-09-13 17:54:23.660314', '2026-09-13 17:54:23.660314');
INSERT INTO public.preguntas VALUES (53, 18, 'ensayo', 'escriba', NULL, 8, true, NULL, '2026-09-13 17:54:50.827172', '2026-09-13 17:54:50.827172');
INSERT INTO public.preguntas VALUES (54, 19, 'seleccion_multiple', 'primera', NULL, 1, true, NULL, '2026-09-13 18:11:05.466431', '2026-09-13 18:11:05.466431');
INSERT INTO public.preguntas VALUES (55, 19, 'seleccion_multiple', 'segunda', NULL, 2, true, NULL, '2026-09-13 18:11:19.080187', '2026-09-13 18:11:19.080187');
INSERT INTO public.preguntas VALUES (56, 19, 'seleccion_multiple', 'tercera', NULL, 3, true, NULL, '2026-09-13 18:11:29.58776', '2026-09-13 18:11:29.58776');
INSERT INTO public.preguntas VALUES (57, 19, 'seleccion_multiple', 'curta', NULL, 4, true, NULL, '2026-09-13 18:11:47.924846', '2026-09-13 18:11:47.924846');
INSERT INTO public.preguntas VALUES (58, 19, 'seleccion_multiple', 'quinta', NULL, 5, true, NULL, '2026-09-13 18:11:58.356192', '2026-09-13 18:11:58.356192');
INSERT INTO public.preguntas VALUES (59, 19, 'seleccion_multiple', 'sexta', NULL, 6, true, NULL, '2026-09-13 18:12:11.066958', '2026-09-13 18:12:11.066958');
INSERT INTO public.preguntas VALUES (60, 19, 'seleccion_multiple', 'septima', NULL, 7, true, NULL, '2026-09-13 18:12:24.18777', '2026-09-13 18:12:24.18777');
INSERT INTO public.preguntas VALUES (61, 19, 'seleccion_multiple', 'octava', NULL, 8, true, NULL, '2026-09-13 18:12:49.631257', '2026-09-13 18:12:49.631257');
INSERT INTO public.preguntas VALUES (62, 19, 'ensayo', 'abierta1', NULL, 9, true, NULL, '2026-09-13 18:13:02.22085', '2026-09-13 18:13:02.22085');
INSERT INTO public.preguntas VALUES (63, 19, 'ensayo', 'abierta 2', NULL, 10, true, NULL, '2026-09-13 18:13:09.574385', '2026-09-13 18:13:09.574385');


--
-- Data for Name: respuesta_detalle; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.respuesta_detalle VALUES (56, 34, 46, '130', NULL, NULL, NULL, false, NULL, '2026-09-13 17:56:26.114802');
INSERT INTO public.respuesta_detalle VALUES (57, 34, 47, 'respuesta', NULL, NULL, NULL, false, NULL, '2026-09-13 17:56:26.120808');
INSERT INTO public.respuesta_detalle VALUES (58, 34, 48, '132', NULL, NULL, NULL, false, NULL, '2026-09-13 17:56:26.121994');
INSERT INTO public.respuesta_detalle VALUES (59, 34, 49, '135', NULL, NULL, NULL, false, NULL, '2026-09-13 17:56:26.122704');
INSERT INTO public.respuesta_detalle VALUES (60, 34, 50, '138', NULL, NULL, NULL, false, NULL, '2026-09-13 17:56:26.123344');
INSERT INTO public.respuesta_detalle VALUES (61, 34, 51, '141', NULL, NULL, NULL, false, NULL, '2026-09-13 17:56:26.123921');
INSERT INTO public.respuesta_detalle VALUES (62, 34, 52, '142', NULL, NULL, NULL, false, NULL, '2026-09-13 17:56:26.12472');
INSERT INTO public.respuesta_detalle VALUES (63, 34, 53, 'respuesta 2', NULL, NULL, NULL, false, NULL, '2026-09-13 17:56:26.125369');
INSERT INTO public.respuesta_detalle VALUES (64, 35, 54, '145', NULL, NULL, NULL, false, NULL, '2026-09-13 18:14:05.021497');
INSERT INTO public.respuesta_detalle VALUES (65, 35, 55, '148', NULL, NULL, NULL, false, NULL, '2026-09-13 18:14:05.024141');
INSERT INTO public.respuesta_detalle VALUES (66, 35, 56, '151', NULL, NULL, NULL, false, NULL, '2026-09-13 18:14:05.02482');
INSERT INTO public.respuesta_detalle VALUES (67, 35, 57, '153', NULL, NULL, NULL, false, NULL, '2026-09-13 18:14:05.025511');
INSERT INTO public.respuesta_detalle VALUES (68, 35, 58, '154', NULL, NULL, NULL, false, NULL, '2026-09-13 18:14:05.026273');
INSERT INTO public.respuesta_detalle VALUES (69, 35, 59, '156', NULL, NULL, NULL, false, NULL, '2026-09-13 18:14:05.027319');
INSERT INTO public.respuesta_detalle VALUES (70, 35, 60, '158', NULL, NULL, NULL, false, NULL, '2026-09-13 18:14:05.028442');
INSERT INTO public.respuesta_detalle VALUES (71, 35, 61, '161', NULL, NULL, NULL, false, NULL, '2026-09-13 18:14:05.029251');
INSERT INTO public.respuesta_detalle VALUES (72, 35, 62, 'uno', NULL, 0.50, NULL, true, '2026-09-13 18:59:50.918224', '2026-09-13 18:14:05.029842');
INSERT INTO public.respuesta_detalle VALUES (73, 35, 63, 'dos', NULL, 0.50, NULL, true, '2026-09-13 18:59:54.351715', '2026-09-13 18:14:05.030368');


--
-- Data for Name: respuestas_estudiante; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.respuestas_estudiante VALUES (34, 18, 3, 'enviada', NULL, NULL, NULL, NULL, 1, '2026-09-13 17:56:26.103795', '2026-09-13 17:56:26.103795');
INSERT INTO public.respuestas_estudiante VALUES (35, 19, 3, 'enviada', NULL, NULL, NULL, NULL, 1, '2026-09-13 18:14:05.017801', '2026-09-13 18:14:05.017801');


--
-- Data for Name: rubricas; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.usuarios VALUES (5, 'bustos.andres@teinco.edu.co', '$2b$10$hash_est3', 'Andres Felipe', 'Bustos Marroquin', 'estudiante', true, '3014444446', '1110000003', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (6, 'cardenas.juan@teinco.edu.co', '$2b$10$hash_est4', 'Juan Stevan', 'Cardenas Gualdron', 'estudiante', true, '3014444447', '1110000004', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (7, 'castillo.jeison@teinco.edu.co', '$2b$10$hash_est5', 'Jeison Esteban', 'Castillo Castillo', 'estudiante', true, '3014444448', '1110000005', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (8, 'catolico.lizeth@teinco.edu.co', '$2b$10$hash_est6', 'Lizeth Alejandra', 'Catolico Herrera', 'estudiante', true, '3014444449', '1110000006', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (9, 'chunza.juan@teinco.edu.co', '$2b$10$hash_est7', 'Juan David', 'Chunza Alfonso', 'estudiante', true, '3014444450', '1110000007', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (10, 'cometa.natalia@teinco.edu.co', '$2b$10$hash_est8', 'Natalia', 'Cometa Tuta', 'estudiante', true, '3014444451', '1110000008', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (11, 'cupajita.david@teinco.edu.co', '$2b$10$hash_est9', 'David Santiago', 'Cupajita Buitrago', 'estudiante', true, '3014444452', '1110000009', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (12, 'delgadillo.jean@teinco.edu.co', '$2b$10$hash_est10', 'Jean Paul', 'Delgadillo Moreno', 'estudiante', true, '3014444453', '1110000010', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (13, 'diaz.diego@teinco.edu.co', '$2b$10$hash_est11', 'Diego Hernando', 'Diaz Cortes', 'estudiante', true, '3014444454', '1110000011', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (14, 'florez.david@teinco.edu.co', '$2b$10$hash_est12', 'David Santiago', 'Florez Perilla', 'estudiante', true, '3014444455', '1110000012', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (15, 'forero.juana@teinco.edu.co', '$2b$10$hash_est13', 'Juana Valentina', 'Forero Fonseca', 'estudiante', true, '3014444456', '1110000013', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (16, 'gonzalez.thomas@teinco.edu.co', '$2b$10$hash_est14', 'Thomas Felipe', 'Gonzalez Ramirez', 'estudiante', true, '3014444457', '1110000014', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (17, 'gutierrez.alex@teinco.edu.co', '$2b$10$hash_est15', 'Alex Andres', 'Gutierrez Ramirez', 'estudiante', true, '3014444458', '1110000015', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (18, 'medina.sara@teinco.edu.co', '$2b$10$hash_est16', 'Sara', 'Medina Correa', 'estudiante', true, '3014444459', '1110000016', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (19, 'molina.melanie@teinco.edu.co', '$2b$10$hash_est17', 'Melanie Shanaia', 'Molina Mendez', 'estudiante', true, '3014444460', '1110000017', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (20, 'pinilla.dilan@teinco.edu.co', '$2b$10$hash_est18', 'Dilan Stef', 'Pinilla Prieto', 'estudiante', true, '3014444461', '1110000018', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (21, 'poveda.santiago@teinco.edu.co', '$2b$10$hash_est19', 'Santiago', 'Poveda Martinez', 'estudiante', true, '3014444462', '1110000019', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (22, 'racero.neil@teinco.edu.co', '$2b$10$hash_est20', 'Neil Ninrod', 'Racero Gonzalez', 'estudiante', true, '3014444463', '1110000020', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (23, 'ramirez.andres@teinco.edu.co', '$2b$10$hash_est21', 'Andres Felipe', 'Ramirez Moya', 'estudiante', true, '3014444464', '1110000021', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (24, 'ramirez.jesus@teinco.edu.co', '$2b$10$hash_est22', 'Jesus Daniel', 'Ramirez Suarez', 'estudiante', true, '3014444465', '1110000022', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (25, 'ramos.juan@teinco.edu.co', '$2b$10$hash_est23', 'Juan Manuel', 'Ramos Beltran', 'estudiante', true, '3014444466', '1110000023', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (26, 'salcedo.juan@teinco.edu.co', '$2b$10$hash_est24', 'Juan Sebastian', 'Salcedo Torres', 'estudiante', true, '3014444467', '1110000024', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (27, 'sanchez.johan@teinco.edu.co', '$2b$10$hash_est25', 'Johan Steban', 'Sanchez Garzon', 'estudiante', true, '3014444468', '1110000025', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (28, 'sanchez.aaron@teinco.edu.co', '$2b$10$hash_est26', 'Aaron', 'Sanchez Quijada', 'estudiante', true, '3014444469', '1110000026', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (29, 'valbuena.gabriel@teinco.edu.co', '$2b$10$hash_est27', 'Gabriel Alejandro', 'Valbuena Matuk', 'estudiante', true, '3014444470', '1110000027', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (30, 'villamizar.deiby@teinco.edu.co', '$2b$10$hash_est28', 'Deiby Alexander', 'Villamizar Perdomo', 'estudiante', true, '3014444471', '1110000028', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (31, 'zambrano.yineth@teinco.edu.co', '$2b$10$hash_est29', 'Yineth Valentina', 'Zambrano Roa', 'estudiante', true, '3014444472', '1110000029', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (33, 'est002@teinco.edu.co', '$2a$10$placeholder2', 'David Camilo', 'Garcia Macchi', 'estudiante', true, '3001000002', 'EST002', '2026-09-10 19:09:10.556081', '2026-09-10 19:09:10.556081');
INSERT INTO public.usuarios VALUES (34, 'est003@teinco.edu.co', '$2a$10$placeholder3', 'Maria Jose', 'Muñoz Bautista', 'estudiante', true, '3001000003', 'EST003', '2026-09-10 19:09:10.556081', '2026-09-10 19:09:10.556081');
INSERT INTO public.usuarios VALUES (35, 'est004@teinco.edu.co', '$2a$10$placeholder4', 'Andres Leonardo', 'Penagos Hernandez', 'estudiante', true, '3001000004', 'EST004', '2026-09-10 19:09:10.556081', '2026-09-10 19:09:10.556081');
INSERT INTO public.usuarios VALUES (36, 'est005@teinco.edu.co', '$2a$10$placeholder5', 'Juan Esteban', 'Perez Morales', 'estudiante', true, '3001000005', 'EST005', '2026-09-10 19:09:10.556081', '2026-09-10 19:09:10.556081');
INSERT INTO public.usuarios VALUES (37, 'docente@teinco.edu.co', '$2a$10$placeholderdocente', 'Carmen', 'Milena Herrera', 'docente', true, NULL, NULL, '2026-09-10 19:09:44.696838', '2026-09-10 19:09:44.696838');
INSERT INTO public.usuarios VALUES (32, 'est001@teinco.edu.co', '$2b$10$fGdfMR21YQD25PUbRSi7MeNfZyarP30uNkvGWltSHpgFPiOSNIrYW', 'Daniela', 'Arias Molano', 'estudiante', true, '3001000001', 'EST001', '2026-09-10 19:09:10.556081', '2026-09-10 19:09:10.556081');
INSERT INTO public.usuarios VALUES (2, 'carmen.milena@teinco.edu.co', '$2b$10$EMya/aBCWydWsLuAEWj7vej8.DFHRsGNcZocBWiI8jKwH9hczJdsW', 'Carmen Milena', 'Herrera', 'docente', true, '3012222222', '1055000001', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (3, 'araujo.juan@teinco.edu.co', '$2b$10$MhtU4ITNryHLBYBCywFi1.FW5SlCvlengIAMxETuHRGrCa4L2YYi2', 'Juan David', 'Araujo Marquez', 'estudiante', true, '3014444444', '1110000001', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (4, 'botache.juan@teinco.edu.co', '$2b$10$Y23XK.TeMsQFpu5sBheNK.CVrIgbzmWyrwI3gqVOH1Uf0KG4wDSpG', 'Juan Esteban', 'Botache Huertas', 'estudiante', true, '3014444445', '1110000002', '2026-09-10 11:57:29.81024', '2026-09-10 11:57:29.81024');
INSERT INTO public.usuarios VALUES (46, 'admin@teinco.edu.co', '$2b$10$MhtU4ITNryHLBYBCywFi1.FW5SlCvlengIAMxETuHRGrCa4L2YYi2', 'Admin', 'Sistema', 'admin', true, NULL, NULL, '2026-09-11 20:24:55.254664', '2026-09-11 20:24:55.254664');
INSERT INTO public.usuarios VALUES (47, 'juan@test.com', '$2b$10$bbOvp97mamcnpBDHUfbDfuljpE04yhQZ7SmL1gZnsGiKFVSpJVot2', 'Juan', 'Perez', 'estudiante', true, NULL, NULL, '2026-09-12 09:00:16.64076', '2026-09-12 09:00:16.64076');


--
-- Name: asignaturas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asignaturas_id_seq', 16, true);


--
-- Name: calificaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.calificaciones_id_seq', 1, false);


--
-- Name: docente_asignatura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.docente_asignatura_id_seq', 12, true);


--
-- Name: estudiante_asignatura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.estudiante_asignatura_id_seq', 2, true);


--
-- Name: estudiante_grupo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.estudiante_grupo_id_seq', 29, true);


--
-- Name: evaluaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.evaluaciones_id_seq', 19, true);


--
-- Name: exportaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.exportaciones_id_seq', 1, false);


--
-- Name: grupos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.grupos_id_seq', 7, true);


--
-- Name: opciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.opciones_id_seq', 161, true);


--
-- Name: preguntas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.preguntas_id_seq', 63, true);


--
-- Name: respuesta_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.respuesta_detalle_id_seq', 73, true);


--
-- Name: respuestas_estudiante_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.respuestas_estudiante_id_seq', 35, true);


--
-- Name: rubricas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rubricas_id_seq', 2, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 48, true);


--
-- Name: asignaturas asignaturas_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignaturas
    ADD CONSTRAINT asignaturas_codigo_key UNIQUE (codigo);


--
-- Name: asignaturas asignaturas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignaturas
    ADD CONSTRAINT asignaturas_pkey PRIMARY KEY (id);


--
-- Name: calificaciones calificaciones_estudiante_id_grupo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calificaciones
    ADD CONSTRAINT calificaciones_estudiante_id_grupo_id_key UNIQUE (estudiante_id, grupo_id);


--
-- Name: calificaciones calificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calificaciones
    ADD CONSTRAINT calificaciones_pkey PRIMARY KEY (id);


--
-- Name: docente_asignatura docente_asignatura_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente_asignatura
    ADD CONSTRAINT docente_asignatura_pkey PRIMARY KEY (id);


--
-- Name: estudiante_asignatura estudiante_asignatura_estudiante_id_asignatura_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estudiante_asignatura
    ADD CONSTRAINT estudiante_asignatura_estudiante_id_asignatura_id_key UNIQUE (estudiante_id, asignatura_id);


--
-- Name: estudiante_asignatura estudiante_asignatura_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estudiante_asignatura
    ADD CONSTRAINT estudiante_asignatura_pkey PRIMARY KEY (id);


--
-- Name: estudiante_grupo estudiante_grupo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estudiante_grupo
    ADD CONSTRAINT estudiante_grupo_pkey PRIMARY KEY (id);


--
-- Name: estudiante_grupo estudiante_grupo_usuario_id_grupo_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estudiante_grupo
    ADD CONSTRAINT estudiante_grupo_usuario_id_grupo_id_key UNIQUE (usuario_id, grupo_id);


--
-- Name: evaluaciones evaluaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_pkey PRIMARY KEY (id);


--
-- Name: exportaciones exportaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exportaciones
    ADD CONSTRAINT exportaciones_pkey PRIMARY KEY (id);


--
-- Name: grupos grupos_asignatura_id_numero_grupo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grupos
    ADD CONSTRAINT grupos_asignatura_id_numero_grupo_key UNIQUE (asignatura_id, numero_grupo);


--
-- Name: grupos grupos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grupos
    ADD CONSTRAINT grupos_pkey PRIMARY KEY (id);


--
-- Name: opciones opciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opciones
    ADD CONSTRAINT opciones_pkey PRIMARY KEY (id);


--
-- Name: opciones opciones_pregunta_id_orden_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opciones
    ADD CONSTRAINT opciones_pregunta_id_orden_key UNIQUE (pregunta_id, orden);


--
-- Name: preguntas preguntas_evaluacion_id_orden_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preguntas
    ADD CONSTRAINT preguntas_evaluacion_id_orden_key UNIQUE (evaluacion_id, orden);


--
-- Name: preguntas preguntas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preguntas
    ADD CONSTRAINT preguntas_pkey PRIMARY KEY (id);


--
-- Name: respuesta_detalle respuesta_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuesta_detalle
    ADD CONSTRAINT respuesta_detalle_pkey PRIMARY KEY (id);


--
-- Name: respuesta_detalle respuesta_detalle_respuesta_estudiante_id_pregunta_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuesta_detalle
    ADD CONSTRAINT respuesta_detalle_respuesta_estudiante_id_pregunta_id_key UNIQUE (respuesta_estudiante_id, pregunta_id);


--
-- Name: respuestas_estudiante respuestas_estudiante_evaluacion_id_estudiante_id_intento_n_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuestas_estudiante
    ADD CONSTRAINT respuestas_estudiante_evaluacion_id_estudiante_id_intento_n_key UNIQUE (evaluacion_id, estudiante_id, intento_numero);


--
-- Name: respuestas_estudiante respuestas_estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuestas_estudiante
    ADD CONSTRAINT respuestas_estudiante_pkey PRIMARY KEY (id);


--
-- Name: rubricas rubricas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubricas
    ADD CONSTRAINT rubricas_pkey PRIMARY KEY (id);


--
-- Name: rubricas rubricas_pregunta_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubricas
    ADD CONSTRAINT rubricas_pregunta_id_key UNIQUE (pregunta_id);


--
-- Name: usuarios usuarios_documento_identidad_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_documento_identidad_key UNIQUE (documento_identidad);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_asignaturas_codigo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asignaturas_codigo ON public.asignaturas USING btree (codigo);


--
-- Name: idx_calificaciones_estudiante; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calificaciones_estudiante ON public.calificaciones USING btree (estudiante_id);


--
-- Name: idx_calificaciones_grupo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calificaciones_grupo ON public.calificaciones USING btree (grupo_id);


--
-- Name: idx_docente_asignatura_grupo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_docente_asignatura_grupo ON public.docente_asignatura USING btree (grupo_id);


--
-- Name: idx_docente_asignatura_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_docente_asignatura_usuario ON public.docente_asignatura USING btree (usuario_id);


--
-- Name: idx_estudiante_grupo_grupo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_estudiante_grupo_grupo ON public.estudiante_grupo USING btree (grupo_id);


--
-- Name: idx_estudiante_grupo_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_estudiante_grupo_usuario ON public.estudiante_grupo USING btree (usuario_id);


--
-- Name: idx_evaluaciones_docente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_evaluaciones_docente ON public.evaluaciones USING btree (docente_id);


--
-- Name: idx_evaluaciones_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_evaluaciones_estado ON public.evaluaciones USING btree (estado);


--
-- Name: idx_evaluaciones_grupo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_evaluaciones_grupo ON public.evaluaciones USING btree (grupo_id);


--
-- Name: idx_exportaciones_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exportaciones_fecha ON public.exportaciones USING btree (fecha_exportacion);


--
-- Name: idx_exportaciones_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exportaciones_usuario ON public.exportaciones USING btree (usuario_id);


--
-- Name: idx_grupos_asignatura; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_grupos_asignatura ON public.grupos USING btree (asignatura_id);


--
-- Name: idx_opciones_pregunta; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_opciones_pregunta ON public.opciones USING btree (pregunta_id);


--
-- Name: idx_preguntas_evaluacion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_preguntas_evaluacion ON public.preguntas USING btree (evaluacion_id);


--
-- Name: idx_respuesta_detalle_pregunta; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_respuesta_detalle_pregunta ON public.respuesta_detalle USING btree (pregunta_id);


--
-- Name: idx_respuesta_detalle_respuesta; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_respuesta_detalle_respuesta ON public.respuesta_detalle USING btree (respuesta_estudiante_id);


--
-- Name: idx_respuestas_estudiante_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_respuestas_estudiante_estado ON public.respuestas_estudiante USING btree (estado);


--
-- Name: idx_respuestas_estudiante_estudiante; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_respuestas_estudiante_estudiante ON public.respuestas_estudiante USING btree (estudiante_id);


--
-- Name: idx_respuestas_estudiante_evaluacion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_respuestas_estudiante_evaluacion ON public.respuestas_estudiante USING btree (evaluacion_id);


--
-- Name: idx_rubricas_pregunta; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rubricas_pregunta ON public.rubricas USING btree (pregunta_id);


--
-- Name: idx_usuarios_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_email ON public.usuarios USING btree (email);


--
-- Name: idx_usuarios_rol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_rol ON public.usuarios USING btree (rol);


--
-- Name: calificaciones calificaciones_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calificaciones
    ADD CONSTRAINT calificaciones_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: calificaciones calificaciones_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calificaciones
    ADD CONSTRAINT calificaciones_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE CASCADE;


--
-- Name: docente_asignatura docente_asignatura_asignatura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente_asignatura
    ADD CONSTRAINT docente_asignatura_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id) ON DELETE CASCADE;


--
-- Name: docente_asignatura docente_asignatura_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente_asignatura
    ADD CONSTRAINT docente_asignatura_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE CASCADE;


--
-- Name: docente_asignatura docente_asignatura_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docente_asignatura
    ADD CONSTRAINT docente_asignatura_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: estudiante_asignatura estudiante_asignatura_asignatura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estudiante_asignatura
    ADD CONSTRAINT estudiante_asignatura_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id) ON DELETE CASCADE;


--
-- Name: estudiante_asignatura estudiante_asignatura_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estudiante_asignatura
    ADD CONSTRAINT estudiante_asignatura_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: estudiante_grupo estudiante_grupo_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estudiante_grupo
    ADD CONSTRAINT estudiante_grupo_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE CASCADE;


--
-- Name: estudiante_grupo estudiante_grupo_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estudiante_grupo
    ADD CONSTRAINT estudiante_grupo_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: evaluaciones evaluaciones_asignatura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id) ON DELETE CASCADE;


--
-- Name: evaluaciones evaluaciones_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: evaluaciones evaluaciones_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE CASCADE;


--
-- Name: exportaciones exportaciones_asignatura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exportaciones
    ADD CONSTRAINT exportaciones_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id) ON DELETE SET NULL;


--
-- Name: exportaciones exportaciones_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exportaciones
    ADD CONSTRAINT exportaciones_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE SET NULL;


--
-- Name: exportaciones exportaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exportaciones
    ADD CONSTRAINT exportaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: grupos grupos_asignatura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grupos
    ADD CONSTRAINT grupos_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id) ON DELETE CASCADE;


--
-- Name: opciones opciones_pregunta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opciones
    ADD CONSTRAINT opciones_pregunta_id_fkey FOREIGN KEY (pregunta_id) REFERENCES public.preguntas(id) ON DELETE CASCADE;


--
-- Name: preguntas preguntas_evaluacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preguntas
    ADD CONSTRAINT preguntas_evaluacion_id_fkey FOREIGN KEY (evaluacion_id) REFERENCES public.evaluaciones(id) ON DELETE CASCADE;


--
-- Name: respuesta_detalle respuesta_detalle_opcion_seleccionada_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuesta_detalle
    ADD CONSTRAINT respuesta_detalle_opcion_seleccionada_id_fkey FOREIGN KEY (opcion_seleccionada_id) REFERENCES public.opciones(id) ON DELETE SET NULL;


--
-- Name: respuesta_detalle respuesta_detalle_pregunta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuesta_detalle
    ADD CONSTRAINT respuesta_detalle_pregunta_id_fkey FOREIGN KEY (pregunta_id) REFERENCES public.preguntas(id) ON DELETE CASCADE;


--
-- Name: respuesta_detalle respuesta_detalle_respuesta_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuesta_detalle
    ADD CONSTRAINT respuesta_detalle_respuesta_estudiante_id_fkey FOREIGN KEY (respuesta_estudiante_id) REFERENCES public.respuestas_estudiante(id) ON DELETE CASCADE;


--
-- Name: respuestas_estudiante respuestas_estudiante_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuestas_estudiante
    ADD CONSTRAINT respuestas_estudiante_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: respuestas_estudiante respuestas_estudiante_evaluacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuestas_estudiante
    ADD CONSTRAINT respuestas_estudiante_evaluacion_id_fkey FOREIGN KEY (evaluacion_id) REFERENCES public.evaluaciones(id) ON DELETE CASCADE;


--
-- Name: rubricas rubricas_pregunta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubricas
    ADD CONSTRAINT rubricas_pregunta_id_fkey FOREIGN KEY (pregunta_id) REFERENCES public.preguntas(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Zlt2Zalby5P65p17sNS3ekGyQdWHcOkeRXobeHoo0qA6RkjyHL2ee6gmFetQMA6

