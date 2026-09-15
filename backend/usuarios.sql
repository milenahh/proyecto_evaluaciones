--
-- PostgreSQL database dump
--

\restrict 4kU44TKBrfzWlzj4DMtNUnM5RnXBZBXpwIGkJYr0jexm86Uod62dFfURxxN70gD

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
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 48, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 4kU44TKBrfzWlzj4DMtNUnM5RnXBZBXpwIGkJYr0jexm86Uod62dFfURxxN70gD

