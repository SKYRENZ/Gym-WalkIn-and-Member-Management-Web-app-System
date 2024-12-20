PGDMP                      |            GymDB    17.2    17.2 +    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    16386    GymDB    DATABASE     �   CREATE DATABASE "GymDB" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_Philippines.1252';
    DROP DATABASE "GymDB";
                     postgres    false            �            1259    16388    customer    TABLE     �   CREATE TABLE public.customer (
    customer_id integer NOT NULL,
    name character varying(100) NOT NULL,
    contact_info character varying(255),
    membership_type character varying(50),
    payment_information text
);
    DROP TABLE public.customer;
       public         heap r       postgres    false            �            1259    16387    customer_customer_id_seq    SEQUENCE     �   CREATE SEQUENCE public.customer_customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.customer_customer_id_seq;
       public               postgres    false    218            �           0    0    customer_customer_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.customer_customer_id_seq OWNED BY public.customer.customer_id;
          public               postgres    false    217            �            1259    16435    income    TABLE     �   CREATE TABLE public.income (
    income_id integer NOT NULL,
    source character varying(100) NOT NULL,
    amount numeric(10,2) NOT NULL,
    date date NOT NULL,
    payment_id integer
);
    DROP TABLE public.income;
       public         heap r       postgres    false            �            1259    16434    income_income_id_seq    SEQUENCE     �   CREATE SEQUENCE public.income_income_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.income_income_id_seq;
       public               postgres    false    226            �           0    0    income_income_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.income_income_id_seq OWNED BY public.income.income_id;
          public               postgres    false    225            �            1259    16397 
   membership    TABLE     �   CREATE TABLE public.membership (
    membership_id integer NOT NULL,
    customer_id integer,
    start_date date NOT NULL,
    end_date date,
    status character varying(50) NOT NULL
);
    DROP TABLE public.membership;
       public         heap r       postgres    false            �            1259    16396    membership_membership_id_seq    SEQUENCE     �   CREATE SEQUENCE public.membership_membership_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.membership_membership_id_seq;
       public               postgres    false    220            �           0    0    membership_membership_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.membership_membership_id_seq OWNED BY public.membership.membership_id;
          public               postgres    false    219            �            1259    16409    payment    TABLE     �  CREATE TABLE public.payment (
    payment_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    method character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    payment_date date NOT NULL,
    customer_id integer,
    membership_id integer,
    gcash_refnum character varying(100),
    maya_refnum character varying(100),
    voucher_code character varying(100)
);
    DROP TABLE public.payment;
       public         heap r       postgres    false            �            1259    16408    payment_payment_id_seq    SEQUENCE     �   CREATE SEQUENCE public.payment_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.payment_payment_id_seq;
       public               postgres    false    222            �           0    0    payment_payment_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.payment_payment_id_seq OWNED BY public.payment.payment_id;
          public               postgres    false    221            �            1259    16426    staff    TABLE     �   CREATE TABLE public.staff (
    staff_id integer NOT NULL,
    name character varying(100) NOT NULL,
    role character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    contact_info character varying(255)
);
    DROP TABLE public.staff;
       public         heap r       postgres    false            �            1259    16425    staff_staff_id_seq    SEQUENCE     �   CREATE SEQUENCE public.staff_staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.staff_staff_id_seq;
       public               postgres    false    224            �           0    0    staff_staff_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.staff_staff_id_seq OWNED BY public.staff.staff_id;
          public               postgres    false    223            5           2604    16391    customer customer_id    DEFAULT     |   ALTER TABLE ONLY public.customer ALTER COLUMN customer_id SET DEFAULT nextval('public.customer_customer_id_seq'::regclass);
 C   ALTER TABLE public.customer ALTER COLUMN customer_id DROP DEFAULT;
       public               postgres    false    217    218    218            9           2604    16438    income income_id    DEFAULT     t   ALTER TABLE ONLY public.income ALTER COLUMN income_id SET DEFAULT nextval('public.income_income_id_seq'::regclass);
 ?   ALTER TABLE public.income ALTER COLUMN income_id DROP DEFAULT;
       public               postgres    false    225    226    226            6           2604    16400    membership membership_id    DEFAULT     �   ALTER TABLE ONLY public.membership ALTER COLUMN membership_id SET DEFAULT nextval('public.membership_membership_id_seq'::regclass);
 G   ALTER TABLE public.membership ALTER COLUMN membership_id DROP DEFAULT;
       public               postgres    false    220    219    220            7           2604    16412    payment payment_id    DEFAULT     x   ALTER TABLE ONLY public.payment ALTER COLUMN payment_id SET DEFAULT nextval('public.payment_payment_id_seq'::regclass);
 A   ALTER TABLE public.payment ALTER COLUMN payment_id DROP DEFAULT;
       public               postgres    false    222    221    222            8           2604    16429    staff staff_id    DEFAULT     p   ALTER TABLE ONLY public.staff ALTER COLUMN staff_id SET DEFAULT nextval('public.staff_staff_id_seq'::regclass);
 =   ALTER TABLE public.staff ALTER COLUMN staff_id DROP DEFAULT;
       public               postgres    false    223    224    224            �          0    16388    customer 
   TABLE DATA           i   COPY public.customer (customer_id, name, contact_info, membership_type, payment_information) FROM stdin;
    public               postgres    false    218   �3       �          0    16435    income 
   TABLE DATA           M   COPY public.income (income_id, source, amount, date, payment_id) FROM stdin;
    public               postgres    false    226   �3       �          0    16397 
   membership 
   TABLE DATA           ^   COPY public.membership (membership_id, customer_id, start_date, end_date, status) FROM stdin;
    public               postgres    false    220   �3       �          0    16409    payment 
   TABLE DATA           �   COPY public.payment (payment_id, amount, method, status, payment_date, customer_id, membership_id, gcash_refnum, maya_refnum, voucher_code) FROM stdin;
    public               postgres    false    222   4       �          0    16426    staff 
   TABLE DATA           M   COPY public.staff (staff_id, name, role, password, contact_info) FROM stdin;
    public               postgres    false    224   4       �           0    0    customer_customer_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.customer_customer_id_seq', 1, false);
          public               postgres    false    217            �           0    0    income_income_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.income_income_id_seq', 1, false);
          public               postgres    false    225            �           0    0    membership_membership_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.membership_membership_id_seq', 1, false);
          public               postgres    false    219            �           0    0    payment_payment_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.payment_payment_id_seq', 1, false);
          public               postgres    false    221            �           0    0    staff_staff_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.staff_staff_id_seq', 1, false);
          public               postgres    false    223            ;           2606    16395    customer customer_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (customer_id);
 @   ALTER TABLE ONLY public.customer DROP CONSTRAINT customer_pkey;
       public                 postgres    false    218            C           2606    16440    income income_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public.income
    ADD CONSTRAINT income_pkey PRIMARY KEY (income_id);
 <   ALTER TABLE ONLY public.income DROP CONSTRAINT income_pkey;
       public                 postgres    false    226            =           2606    16402    membership membership_pkey 
   CONSTRAINT     c   ALTER TABLE ONLY public.membership
    ADD CONSTRAINT membership_pkey PRIMARY KEY (membership_id);
 D   ALTER TABLE ONLY public.membership DROP CONSTRAINT membership_pkey;
       public                 postgres    false    220            ?           2606    16414    payment payment_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (payment_id);
 >   ALTER TABLE ONLY public.payment DROP CONSTRAINT payment_pkey;
       public                 postgres    false    222            A           2606    16433    staff staff_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (staff_id);
 :   ALTER TABLE ONLY public.staff DROP CONSTRAINT staff_pkey;
       public                 postgres    false    224            G           2606    16441    income income_payment_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.income
    ADD CONSTRAINT income_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payment(payment_id);
 G   ALTER TABLE ONLY public.income DROP CONSTRAINT income_payment_id_fkey;
       public               postgres    false    4671    222    226            D           2606    16403 &   membership membership_customer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.membership
    ADD CONSTRAINT membership_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer(customer_id);
 P   ALTER TABLE ONLY public.membership DROP CONSTRAINT membership_customer_id_fkey;
       public               postgres    false    4667    220    218            E           2606    16415     payment payment_customer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer(customer_id);
 J   ALTER TABLE ONLY public.payment DROP CONSTRAINT payment_customer_id_fkey;
       public               postgres    false    222    4667    218            F           2606    16420 "   payment payment_membership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_membership_id_fkey FOREIGN KEY (membership_id) REFERENCES public.membership(membership_id);
 L   ALTER TABLE ONLY public.payment DROP CONSTRAINT payment_membership_id_fkey;
       public               postgres    false    222    220    4669            �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �     