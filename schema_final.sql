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


