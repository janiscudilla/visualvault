import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDownAZ, FolderHeart, Frame, Grid3X3, ImagePlus, Images,
  LoaderCircle, LogIn, LogOut, Pencil, Plus, Search,
  SlidersHorizontal, Trash2, Upload, UsersRound, X,
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot,
  orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDGsiSVg8NcSCw6Ciej3kQqrSyfNeGyUV4',
  authDomain: 'prettypeoplefolder.firebaseapp.com',
  projectId: 'prettypeoplefolder',
  messagingSenderId: '382579714831',
  appId: '1:382579714831:web:656337c8c04dfceadfac7a',
};

// After your first Google sign-in, paste your Firebase UID between these quotes.
const ownerUid = '';
const privateMode = true;
const firebaseReady = true;

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const PHOTOS_COLLECTION = 'prettyPeoplePhotos';

function watchPhotos(onData, onError) {
  const photosQuery = query(collection(db, PHOTOS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    photosQuery,
    (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

async function createPhoto(data) {
  return addDoc(collection(db, PHOTOS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

async function changePhoto(id, data) {
  return updateDoc(doc(db, PHOTOS_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

async function removePhoto(photo) {
  await deleteDoc(doc(db, PHOTOS_COLLECTION, photo.id));
}

const APP_STYLES = ":root {\n  font-family: 'DM Sans', system-ui, sans-serif;\n  color: #f8f2ec;\n  background: #120e14;\n  font-synthesis: none;\n  --bg: #120e14;\n  --surface: #1c151f;\n  --surface-2: #251c29;\n  --surface-3: #2d2231;\n  --border: #3a2d3e;\n  --text: #f8f2ec;\n  --muted: #b3a5b8;\n  --faint: #766a7c;\n  --gold: #e6ad58;\n  --gold-soft: #f5cf8e;\n  --plum: #70435c;\n  --danger: #ee937d;\n  --shadow: 0 24px 70px rgba(0, 0, 0, .38);\n}\n\n* { box-sizing: border-box; }\n\nhtml { min-width: 320px; background: var(--bg); }\n\nbody {\n  margin: 0;\n  min-width: 320px;\n  min-height: 100vh;\n  background:\n    radial-gradient(circle at 15% -10%, rgba(112, 67, 92, .22), transparent 38rem),\n    radial-gradient(circle at 90% 0%, rgba(230, 173, 88, .08), transparent 28rem),\n    var(--bg);\n}\n\nbutton, input, select, textarea { font: inherit; }\nbutton { color: inherit; }\nbutton:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {\n  outline: 2px solid var(--gold);\n  outline-offset: 2px;\n}\nbutton:disabled { opacity: .55; cursor: not-allowed; }\n\n.app-shell { min-height: 100vh; }\n.modal-open { overflow: hidden; }\n\n.topbar {\n  position: sticky;\n  z-index: 20;\n  top: 0;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  padding: 1.15rem clamp(1rem, 3vw, 2.5rem);\n  border-bottom: 1px solid rgba(82, 65, 87, .75);\n  background: rgba(18, 14, 20, .86);\n  backdrop-filter: blur(18px);\n}\n\n.brand { display: flex; align-items: center; gap: .8rem; min-width: 0; }\n.brand-mark {\n  display: grid;\n  width: 2.8rem;\n  height: 2.8rem;\n  flex: 0 0 auto;\n  place-items: center;\n  color: #211519;\n  border-radius: .8rem;\n  background: linear-gradient(145deg, var(--gold-soft), var(--gold));\n  box-shadow: inset 0 1px rgba(255,255,255,.5), 0 9px 24px rgba(230,173,88,.15);\n}\n\n.brand h1, .locked-screen h1, .modal h2, .empty-state h2 {\n  margin: 0;\n  font-family: 'Fraunces', Georgia, serif;\n  font-weight: 600;\n}\n.brand h1 { font-size: clamp(1.3rem, 2.2vw, 1.75rem); line-height: 1.05; }\n.brand p { margin: .25rem 0 0; color: var(--muted); font-size: .78rem; font-style: italic; }\n.header-actions { display: flex; align-items: center; gap: .6rem; }\n\n.primary-button, .secondary-button, .quiet-button, .delete-button {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: .45rem;\n  min-height: 2.6rem;\n  padding: .68rem 1rem;\n  border-radius: 999px;\n  cursor: pointer;\n  font-weight: 700;\n  font-size: .86rem;\n}\n.primary-button { color: #24160d; border: 1px solid #f0bf70; background: linear-gradient(180deg, #f2bd69, #dea04a); box-shadow: 0 8px 24px rgba(230,173,88,.13); }\n.primary-button:hover { filter: brightness(1.05); transform: translateY(-1px); }\n.secondary-button { border: 1px solid var(--border); background: var(--surface-2); }\n.secondary-button:hover, .quiet-button:hover { background: var(--surface-3); }\n.quiet-button { color: var(--muted); border: 1px solid var(--border); background: transparent; }\n.delete-button { color: var(--danger); border: 1px solid rgba(238,147,125,.3); background: transparent; }\n.icon-button {\n  display: grid;\n  width: 2.55rem;\n  height: 2.55rem;\n  padding: 0;\n  place-items: center;\n  border: 1px solid var(--border);\n  border-radius: 50%;\n  background: var(--surface-2);\n  cursor: pointer;\n}\n.icon-button:hover { background: var(--surface-3); }\n.demo-pill { padding: .4rem .7rem; border: 1px solid rgba(230,173,88,.3); border-radius: 999px; color: var(--gold-soft); background: rgba(230,173,88,.1); font-size: .75rem; }\n\nmain { width: min(1240px, calc(100% - 2rem)); margin: 0 auto; padding: 1.5rem 0 4rem; }\n\n.summary-row {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(85px, 130px)) minmax(180px, 1fr);\n  gap: .7rem;\n  margin-bottom: 1rem;\n}\n.stat, .favorite-stat {\n  min-height: 5rem;\n  padding: .85rem 1rem;\n  border: 1px solid var(--border);\n  border-radius: 1rem;\n  background: linear-gradient(145deg, rgba(37,28,41,.92), rgba(28,21,31,.92));\n}\n.stat { display: flex; flex-direction: column; justify-content: center; }\n.stat strong { color: var(--gold-soft); font-family: 'Fraunces', serif; font-size: 1.55rem; font-weight: 600; line-height: 1; }\n.stat span, .favorite-stat span { margin-top: .3rem; color: var(--muted); font-size: .76rem; }\n.favorite-stat { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; text-align: right; }\n.favorite-stat strong { margin-top: .25rem; font-family: 'Fraunces', serif; font-size: 1.05rem; }\n\n.controls { padding: .8rem; border: 1px solid var(--border); border-radius: 1.15rem; background: rgba(28,21,31,.8); box-shadow: 0 12px 35px rgba(0,0,0,.12); }\n.search-box {\n  display: flex;\n  align-items: center;\n  gap: .65rem;\n  min-height: 3rem;\n  padding: 0 .9rem;\n  color: var(--muted);\n  border: 1px solid var(--border);\n  border-radius: .8rem;\n  background: var(--surface-2);\n}\n.search-box:focus-within { border-color: rgba(230,173,88,.65); box-shadow: 0 0 0 3px rgba(230,173,88,.08); }\n.search-box input { width: 100%; border: 0; outline: 0; color: var(--text); background: transparent; font-size: .95rem; }\n.search-box input::placeholder { color: #8d8091; }\n.search-box button { display: grid; padding: .25rem; border: 0; color: var(--muted); background: transparent; cursor: pointer; }\n\n.control-row { display: flex; align-items: center; gap: .6rem; margin-top: .7rem; }\n.filter-button, .sort-control, .view-switcher { border: 1px solid var(--border); border-radius: 999px; background: var(--surface-2); }\n.filter-button { display: inline-flex; align-items: center; gap: .4rem; min-height: 2.4rem; padding: .55rem .85rem; cursor: pointer; }\n.filter-button.active { border-color: rgba(230,173,88,.45); }\n.filter-button b { display: grid; width: 1.25rem; height: 1.25rem; place-items: center; border-radius: 50%; color: #24160d; background: var(--gold); font-size: .7rem; }\n.sort-control { display: flex; align-items: center; gap: .35rem; min-height: 2.4rem; padding: 0 .35rem 0 .75rem; color: var(--muted); }\n.sort-control select, .filter-select select { border: 0; outline: 0; color: var(--text); background: transparent; cursor: pointer; }\n.sort-control select { min-height: 2.2rem; padding: 0 1.3rem 0 .2rem; font-size: .82rem; }\n.sort-control option, .filter-select option, .metadata-form option { color: var(--text); background: var(--surface-2); }\n.view-switcher { display: flex; margin-left: auto; padding: .2rem; }\n.view-switcher button { display: inline-flex; align-items: center; gap: .35rem; min-height: 2rem; padding: .42rem .7rem; border: 0; border-radius: 999px; color: var(--muted); background: transparent; cursor: pointer; font-size: .78rem; }\n.view-switcher button.active { color: #24160d; background: var(--gold); }\n\n.filter-drawer { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)) auto; align-items: end; gap: .75rem; margin-top: .8rem; padding: .85rem; border-top: 1px solid var(--border); }\n.filter-select { display: grid; gap: .3rem; }\n.filter-select span { color: var(--muted); font-size: .72rem; }\n.filter-select select { width: 100%; min-height: 2.45rem; padding: 0 .75rem; border: 1px solid var(--border); border-radius: .65rem; background: var(--surface); }\n.clear-button { min-height: 2.45rem; padding: 0 .65rem; border: 0; color: var(--gold-soft); background: transparent; cursor: pointer; font-size: .8rem; }\n\n.results-line { display: flex; align-items: center; justify-content: space-between; min-height: 2.6rem; margin-top: .7rem; color: var(--muted); font-size: .8rem; }\n.results-line button { display: inline-flex; align-items: center; gap: .3rem; padding: .35rem .6rem; border: 1px solid var(--border); border-radius: 999px; background: var(--surface-2); cursor: pointer; }\n\n.album-stack { display: grid; gap: 1.5rem; }\n.binder-page {\n  position: relative;\n  padding: 1.65rem 1.45rem 2rem 2.7rem;\n  border: 1px solid rgba(219,211,220,.16);\n  border-radius: .45rem 1rem 1rem .45rem;\n  background:\n    linear-gradient(115deg, rgba(255,255,255,.045), transparent 28%),\n    linear-gradient(160deg, rgba(217,223,225,.13), rgba(119,111,123,.045));\n  box-shadow: var(--shadow), inset 0 1px rgba(255,255,255,.13);\n  overflow: hidden;\n}\n.binder-page::after {\n  content: '';\n  position: absolute;\n  z-index: 3;\n  inset: 0;\n  pointer-events: none;\n  background: linear-gradient(110deg, transparent 7%, rgba(255,255,255,.075) 29%, transparent 43%);\n}\n.binder-rings { position: absolute; z-index: 5; left: -.2rem; top: 16%; bottom: 16%; display: flex; flex-direction: column; justify-content: space-around; }\n.binder-rings i { display: block; width: 2rem; height: .55rem; border: 2px solid #a99383; border-left: 0; border-radius: 0 999px 999px 0; background: linear-gradient(#e5d6c6, #8a776c); box-shadow: 2px 2px 5px rgba(0,0,0,.4); }\n.pocket-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(.65rem, 1.5vw, 1.15rem); }\n.album-pocket {\n  position: relative;\n  display: flex;\n  min-width: 0;\n  padding: clamp(.35rem, .8vw, .58rem);\n  flex-direction: column;\n  border: 1px solid rgba(230,226,234,.23);\n  border-radius: .42rem;\n  background: rgba(224,227,232,.07);\n  box-shadow: inset 0 0 0 1px rgba(255,255,255,.035), 0 8px 18px rgba(0,0,0,.2);\n  cursor: pointer;\n  text-align: left;\n  overflow: hidden;\n}\n.album-pocket::after { content: ''; position: absolute; z-index: 2; inset: 0; pointer-events: none; background: linear-gradient(125deg, rgba(255,255,255,.12), transparent 24%, transparent 70%, rgba(255,255,255,.04)); }\n.album-pocket:hover { border-color: rgba(230,173,88,.55); transform: translateY(-2px); }\n.pocket-photo { display: block; aspect-ratio: 4 / 5; border-radius: .28rem; background: #2d2231; overflow: hidden; }\n.pocket-photo img, .person-portrait img, .wall-frame img, .detail-image img { width: 100%; height: 100%; object-fit: cover; }\n.pocket-caption { display: grid; min-width: 0; padding: .55rem .15rem .15rem; }\n.pocket-caption strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: clamp(.76rem, 1.5vw, .98rem); }\n.pocket-caption small { overflow: hidden; margin-top: .1rem; color: var(--muted); text-overflow: ellipsis; white-space: nowrap; font-size: clamp(.65rem, 1.1vw, .74rem); }\n.empty-pocket { aspect-ratio: 4 / 6; cursor: default; opacity: .45; }\n.empty-pocket:hover { border-color: rgba(230,226,234,.23); transform: none; }\n.page-number { position: absolute; right: 1.2rem; bottom: .55rem; color: rgba(244,236,245,.4); font-family: 'Fraunces', serif; font-size: .72rem; }\n.photo-placeholder { display: grid; width: 100%; height: 100%; place-items: center; color: rgba(255,245,235,.9); background: radial-gradient(circle at 35% 25%, rgba(255,255,255,.14), transparent 35%), linear-gradient(145deg, var(--placeholder), #2b202d); }\n.photo-placeholder span { font-family: 'Fraunces', serif; font-size: clamp(1.4rem, 5vw, 3.2rem); letter-spacing: .08em; }\n\n.gallery-wall {\n  display: grid;\n  grid-template-columns: repeat(12, 1fr);\n  grid-auto-flow: dense;\n  gap: clamp(1rem, 2vw, 1.8rem);\n  padding: clamp(1.2rem, 3vw, 2.5rem);\n  border: 1px solid #d2b79022;\n  border-radius: .55rem;\n  background: linear-gradient(110deg, rgba(255,239,210,.055), transparent), #1a151a;\n  box-shadow: var(--shadow), inset 0 0 70px rgba(230,173,88,.035);\n}\n.wall-frame { grid-column: span 3; display: flex; padding: .55rem; flex-direction: column; border: 4px solid #9d7548; border-radius: 2px; background: linear-gradient(145deg, #ad8658, #604329); box-shadow: 0 12px 22px rgba(0,0,0,.35), inset 0 0 0 1px #d6b07c; cursor: pointer; }\n.wall-frame.frame-2, .wall-frame.frame-5 { grid-column: span 4; }\n.wall-frame.frame-3 { grid-column: span 5; }\n.wall-frame:hover { transform: translateY(-3px) rotate(.25deg); box-shadow: 0 18px 30px rgba(0,0,0,.43); }\n.frame-mat { display: block; aspect-ratio: 4 / 5; padding: .65rem; background: #e8ddcd; overflow: hidden; }\n.frame-label { padding: .55rem .25rem .2rem; color: #fff4e4; font-family: 'Fraunces', serif; font-size: .85rem; }\n\n.people-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }\n.person-card { display: grid; grid-template-columns: 5.2rem 1fr; gap: .9rem; align-items: center; padding: .65rem; border: 1px solid var(--border); border-radius: 1rem; background: linear-gradient(145deg, var(--surface-2), var(--surface)); cursor: pointer; text-align: left; }\n.person-card:hover { border-color: rgba(230,173,88,.45); transform: translateY(-2px); }\n.person-portrait { display: block; width: 5.2rem; aspect-ratio: 4 / 5; border-radius: .65rem; overflow: hidden; }\n.person-info { display: flex; min-width: 0; flex-direction: column; }\n.person-info strong { overflow: hidden; font-family: 'Fraunces', serif; font-size: 1.08rem; text-overflow: ellipsis; white-space: nowrap; }\n.person-info small { margin-top: .18rem; color: var(--muted); }\n.person-info em { margin-top: .7rem; color: var(--gold-soft); font-size: .78rem; font-style: normal; }\n\n.empty-state, .content-loading { display: grid; min-height: 24rem; place-items: center; align-content: center; text-align: center; }\n.empty-state > span { display: grid; width: 4.3rem; height: 4.3rem; place-items: center; border: 1px solid rgba(230,173,88,.3); border-radius: 1.2rem; color: var(--gold); background: rgba(230,173,88,.08); }\n.empty-state h2 { margin-top: 1rem; font-size: 1.5rem; }\n.empty-state p { max-width: 32rem; margin: .55rem auto 1rem; color: var(--muted); }\n.content-loading { gap: .6rem; color: var(--muted); }\n.error-banner { margin: .8rem 0; padding: .8rem 1rem; border: 1px solid rgba(238,147,125,.3); border-radius: .8rem; color: #ffd6ce; background: rgba(238,147,125,.08); }\n\nfooter { display: flex; align-items: center; justify-content: center; gap: .35rem; padding: 1.5rem; color: var(--faint); font-size: .75rem; }\n\n.modal-backdrop { position: fixed; z-index: 100; inset: 0; display: grid; padding: 1rem; place-items: center; background: rgba(7,5,8,.78); backdrop-filter: blur(9px); overflow-y: auto; }\n.modal { width: min(900px, 100%); max-height: calc(100vh - 2rem); border: 1px solid var(--border); border-radius: 1.25rem; background: var(--surface); box-shadow: 0 35px 90px rgba(0,0,0,.65); overflow: auto; }\n.modal-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1.25rem 1.35rem; border-bottom: 1px solid var(--border); }\n.modal h2 { font-size: 1.65rem; }\n.eyebrow { margin: 0 0 .3rem; color: var(--gold); font-size: .68rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }\n.editor-layout { display: grid; grid-template-columns: minmax(280px, .9fr) minmax(320px, 1.1fr); }\n.image-editor { padding: 1.25rem; border-right: 1px solid var(--border); background: #161118; }\n.source-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: .35rem; margin-bottom: .8rem; padding: .25rem; border: 1px solid var(--border); border-radius: .8rem; background: var(--surface); }\n.source-tabs button { display: flex; align-items: center; justify-content: center; gap: .4rem; min-height: 2.25rem; border: 0; border-radius: .6rem; color: var(--muted); background: transparent; cursor: pointer; }\n.source-tabs button.active { color: #24160d; background: var(--gold); }\n.drop-zone { display: grid; width: 100%; min-height: 23rem; padding: 2rem; place-items: center; align-content: center; gap: .45rem; border: 1px dashed #68556e; border-radius: .9rem; color: var(--muted); background: rgba(112,67,92,.08); cursor: pointer; }\n.drop-zone strong { color: var(--text); }\n.drop-zone span { font-size: .82rem; }\n.drop-zone.dragging { border-color: var(--gold); color: var(--gold); background: rgba(230,173,88,.08); }\n.url-panel { display: grid; min-height: 23rem; padding: 2rem 1rem; place-items: center; align-content: center; gap: 1rem; color: var(--muted); }\n.url-panel label { display: grid; width: 100%; gap: .35rem; font-size: .78rem; }\n.url-panel input { width: 100%; }\n.editor-preview { position: relative; aspect-ratio: 4 / 5; max-height: 25rem; border-radius: .8rem; background: #0c090d; overflow: hidden; }\n.editor-preview img { width: 100%; height: 100%; object-fit: cover; }\n.editor-preview button { position: absolute; top: .65rem; right: .65rem; display: inline-flex; align-items: center; gap: .3rem; padding: .45rem .65rem; border: 1px solid rgba(255,255,255,.18); border-radius: 999px; background: rgba(15,10,16,.76); cursor: pointer; font-size: .75rem; backdrop-filter: blur(8px); }\n.focal-controls { display: grid; gap: .55rem; margin-top: .8rem; }\n.focal-controls label { display: grid; grid-template-columns: 7rem 1fr; align-items: center; gap: .5rem; color: var(--muted); font-size: .7rem; }\n.focal-controls input { accent-color: var(--gold); }\n.metadata-form { display: flex; padding: 1.35rem; flex-direction: column; gap: 1rem; }\n.metadata-form > label { display: grid; gap: .4rem; }\n.metadata-form > label > span, .url-panel label span { color: var(--muted); font-size: .78rem; }\n.metadata-form b { color: var(--gold); }\n.metadata-form small { color: var(--faint); font-size: .7rem; }\n.metadata-form input, .metadata-form select, .metadata-form textarea, .url-panel input { padding: .72rem .8rem; border: 1px solid var(--border); border-radius: .7rem; outline: 0; color: var(--text); background: var(--surface-2); font-size: .92rem; }\n.metadata-form textarea { resize: vertical; line-height: 1.5; }\n.metadata-form input:focus, .metadata-form select:focus, .metadata-form textarea:focus, .url-panel input:focus { border-color: rgba(230,173,88,.6); }\n.form-error { margin: 0; padding: .7rem .8rem; border-radius: .6rem; color: #ffd3c9; background: rgba(238,147,125,.1); font-size: .78rem; }\n.upload-progress { position: relative; height: 1.7rem; border: 1px solid var(--border); border-radius: 999px; background: var(--surface-2); overflow: hidden; }\n.upload-progress span { position: absolute; inset: 0 auto 0 0; background: rgba(230,173,88,.35); }\n.upload-progress small { position: relative; z-index: 1; display: grid; height: 100%; place-items: center; font-size: .7rem; }\n.form-actions { display: flex; align-items: center; gap: .55rem; margin-top: auto; padding-top: .4rem; }\n.action-spacer { flex: 1; }\n.spin { animation: spin .8s linear infinite; }\n@keyframes spin { to { transform: rotate(360deg); } }\n\n.detail-modal { display: grid; grid-template-columns: minmax(280px, 1.05fr) minmax(250px, .75fr); width: min(820px, 100%); overflow: hidden; }\n.detail-image { min-height: min(70vh, 670px); background: #0c090d; }\n.detail-copy { position: relative; display: flex; padding: 2rem; flex-direction: column; justify-content: center; }\n.detail-copy .icon-button { position: absolute; top: 1rem; right: 1rem; }\n.detail-copy h2 { font-size: clamp(1.8rem, 5vw, 2.8rem); line-height: 1; }\n.detail-group { margin: .55rem 0 0; color: var(--gold-soft); }\n.detail-note { margin: 1.5rem 0; color: var(--muted); line-height: 1.6; }\n.edit-detail { align-self: flex-start; margin-top: .5rem; }\n\n.locked-screen { display: flex; width: min(520px, calc(100% - 2rem)); min-height: 100vh; margin: 0 auto; padding: 3rem 1rem; flex-direction: column; align-items: center; justify-content: center; text-align: center; }\n.locked-folder { display: grid; width: 6.3rem; height: 6.3rem; margin-bottom: 1.35rem; place-items: center; border: 1px solid rgba(230,173,88,.36); border-radius: 1.7rem; color: var(--gold); background: linear-gradient(145deg, rgba(230,173,88,.14), rgba(112,67,92,.16)); box-shadow: 0 25px 70px rgba(0,0,0,.34); }\n.locked-screen h1 { font-size: clamp(2.7rem, 10vw, 4.5rem); line-height: .95; }\n.locked-screen > p:not(.eyebrow):not(.form-error) { max-width: 27rem; color: var(--muted); line-height: 1.55; }\n.sign-in-button { margin-top: 1.1rem; }\n.setup-card { display: grid; width: 100%; margin-top: 1rem; padding: 1rem; gap: .55rem; border: 1px solid var(--border); border-radius: 1rem; color: var(--muted); background: var(--surface); font-size: .85rem; }\n.setup-card strong { color: var(--text); }\n.setup-card .secondary-button { margin: .3rem auto 0; }\n.uid-copy code { word-break: break-all; }\n.app-loading { display: grid; min-height: 100vh; place-items: center; align-content: center; gap: .7rem; color: var(--muted); }\n.toast { position: fixed; z-index: 150; right: 1rem; bottom: 1rem; max-width: min(26rem, calc(100% - 2rem)); padding: .8rem 1rem; border: 1px solid rgba(230,173,88,.34); border-radius: .8rem; color: #fff2dc; background: rgba(42,31,39,.96); box-shadow: var(--shadow); font-size: .82rem; }\n\n@media (max-width: 760px) {\n  .topbar { align-items: flex-start; }\n  .brand p { display: none; }\n  .header-actions { gap: .4rem; }\n  .add-button { width: 2.55rem; padding: 0; }\n  .add-button svg { margin: 0; }\n  .add-button { font-size: 0; }\n  .demo-pill, .quiet-button { display: none; }\n  main { width: min(100% - 1rem, 1240px); padding-top: .75rem; }\n  .summary-row { grid-template-columns: repeat(3, 1fr); gap: .45rem; }\n  .stat { min-height: 4rem; padding: .65rem; }\n  .stat strong { font-size: 1.25rem; }\n  .favorite-stat { grid-column: 1 / -1; min-height: 3.4rem; align-items: flex-start; text-align: left; }\n  .favorite-stat strong { font-size: .95rem; }\n  .control-row { flex-wrap: wrap; }\n  .view-switcher { width: 100%; margin: .1rem 0 0; }\n  .view-switcher button { flex: 1; justify-content: center; }\n  .filter-drawer { grid-template-columns: 1fr; }\n  .binder-page { padding: 1rem .65rem 1.55rem 1.4rem; }\n  .binder-rings { left: -.45rem; }\n  .binder-rings i { width: 1.4rem; }\n  .pocket-grid { gap: .38rem; }\n  .album-pocket { padding: .25rem; }\n  .pocket-caption { padding: .38rem .05rem .08rem; }\n  .pocket-caption strong { font-size: .68rem; }\n  .pocket-caption small { font-size: .58rem; }\n  .empty-pocket { aspect-ratio: 4 / 6.1; }\n  .gallery-wall { grid-template-columns: repeat(6, 1fr); padding: .75rem; gap: .75rem; }\n  .wall-frame, .wall-frame.frame-2, .wall-frame.frame-3, .wall-frame.frame-5 { grid-column: span 3; padding: .35rem; border-width: 3px; }\n  .frame-mat { padding: .35rem; }\n  .frame-label { font-size: .68rem; }\n  .editor-layout, .detail-modal { grid-template-columns: 1fr; }\n  .image-editor { border-right: 0; border-bottom: 1px solid var(--border); }\n  .drop-zone, .url-panel { min-height: 15rem; }\n  .editor-preview { max-height: 19rem; }\n  .detail-image { min-height: 52vh; max-height: 58vh; }\n  .detail-copy { padding: 1.4rem; }\n  .form-actions { flex-wrap: wrap; }\n  .action-spacer { display: none; }\n  .form-actions > * { flex: 1; white-space: nowrap; }\n}\n\n@media (max-width: 420px) {\n  .brand-mark { width: 2.5rem; height: 2.5rem; }\n  .brand h1 { font-size: 1.12rem; }\n  .summary-row { gap: .35rem; }\n  .stat span { font-size: .67rem; }\n  .sort-control { flex: 1; }\n  .sort-control select { width: 100%; }\n  .pocket-caption small { display: none; }\n  .album-pocket { aspect-ratio: .7; }\n  .pocket-photo { flex: 1; aspect-ratio: auto; }\n  .people-grid { grid-template-columns: 1fr; }\n}\n\n@media (prefers-reduced-motion: no-preference) {\n  button, .album-pocket, .person-card, .wall-frame { transition: .18s ease; }\n}\n";
const styleTag = document.createElement('style');
styleTag.textContent = APP_STYLES;
document.head.appendChild(styleTag);


const TYPES = ['Idol', 'Actor', 'Soloist', 'Model', 'Athlete', 'Other'];
const PAGE_SIZE = 9;

const demoPhotos = [
  { id: 'demo-1', person: 'Song Mingi', group: 'ATEEZ', type: 'Idol', note: '', demo: true, color: '#754b5d', initials: 'MG' },
  { id: 'demo-2', person: 'Park Seonghwa', group: 'ATEEZ', type: 'Idol', note: '', demo: true, color: '#675071', initials: 'SH' },
  { id: 'demo-3', person: 'Jeong Yunho', group: 'ATEEZ', type: 'Idol', note: '', demo: true, color: '#465f67', initials: 'YH' },
  { id: 'demo-4', person: 'Kang Yeosang', group: 'ATEEZ', type: 'Idol', note: '', demo: true, color: '#70533f', initials: 'YS' },
  { id: 'demo-5', person: 'Choi San', group: 'ATEEZ', type: 'Idol', note: '', demo: true, color: '#643f48', initials: 'CS' },
  { id: 'demo-6', person: 'Kim Hongjoong', group: 'ATEEZ', type: 'Idol', note: '', demo: true, color: '#4d526f', initials: 'HJ' },
];

const emptyForm = {
  person: '',
  group: '',
  type: 'Idol',
  note: '',
  imageUrl: '',
  focalX: 50,
  focalY: 50,
};

const MAX_STORED_IMAGE_LENGTH = 700_000;

function timeValue(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value.seconds) return value.seconds * 1000;
  return new Date(value).getTime() || 0;
}

function initialsFor(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'PP';
}

function PhotoVisual({ photo, className = '', eager = false }) {
  if (!photo.imageUrl) {
    return (
      <div className={`photo-placeholder ${className}`} style={{ '--placeholder': photo.color || '#694b5a' }}>
        <span>{photo.initials || initialsFor(photo.person)}</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={photo.imageUrl}
      alt={`${photo.person}${photo.group ? ` — ${photo.group}` : ''}`}
      loading={eager ? 'eager' : 'lazy'}
      style={{ objectPosition: `${photo.focalX ?? 50}% ${photo.focalY ?? 50}%` }}
    />
  );
}

function IconButton({ label, children, ...props }) {
  return (
    <button className="icon-button" type="button" aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

function Stat({ value, label }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <label className="filter-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function AlbumCard({ photo, onOpen }) {
  return (
    <button className="album-pocket" type="button" onClick={() => onOpen(photo)}>
      <span className="pocket-photo">
        <PhotoVisual photo={photo} />
      </span>
      <span className="pocket-caption">
        <strong>{photo.person}</strong>
        <small>{photo.group || photo.type}</small>
      </span>
    </button>
  );
}

function AlbumView({ photos, onOpen }) {
  const pages = [];
  for (let index = 0; index < photos.length; index += PAGE_SIZE) {
    pages.push(photos.slice(index, index + PAGE_SIZE));
  }

  return (
    <div className="album-stack">
      {pages.map((page, pageIndex) => (
        <section className="binder-page" key={`page-${page[0]?.id || pageIndex}`} aria-label={`Album page ${pageIndex + 1}`}>
          <div className="binder-rings" aria-hidden="true">
            <i /><i /><i />
          </div>
          <div className="pocket-grid">
            {Array.from({ length: PAGE_SIZE }, (_, cellIndex) => {
              const photo = page[cellIndex];
              return photo
                ? <AlbumCard key={photo.id} photo={photo} onOpen={onOpen} />
                : <div className="album-pocket empty-pocket" key={`empty-${cellIndex}`} aria-hidden="true" />;
            })}
          </div>
          <span className="page-number">{String(pageIndex + 1).padStart(2, '0')}</span>
        </section>
      ))}
    </div>
  );
}

function WallView({ photos, onOpen }) {
  return (
    <div className="gallery-wall">
      {photos.map((photo, index) => (
        <button className={`wall-frame frame-${(index % 5) + 1}`} type="button" key={photo.id} onClick={() => onOpen(photo)}>
          <span className="frame-mat"><PhotoVisual photo={photo} /></span>
          <span className="frame-label">{photo.person}</span>
        </button>
      ))}
    </div>
  );
}

function PeopleView({ photos, counts, onChoose }) {
  const people = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([person, count]) => ({ person, count, photo: photos.find((item) => item.person === person) }));

  return (
    <div className="people-grid">
      {people.map(({ person, count, photo }) => (
        <button className="person-card" type="button" key={person} onClick={() => onChoose(person)}>
          <span className="person-portrait"><PhotoVisual photo={photo} /></span>
          <span className="person-info">
            <strong>{person}</strong>
            <small>{photo.group || photo.type}</small>
            <em>{count} {count === 1 ? 'photo' : 'photos'}</em>
          </span>
        </button>
      ))}
    </div>
  );
}

function Modal({ children, onClose, className = '' }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`modal ${className}`} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  );
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read this image.'));
    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Could not prepare this image.')),
      'image/webp',
      quality,
    );
  });
}

async function compressImage(file) {
  const bitmap = await createImageBitmap(file);
  const maxDimension = 1200;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  let width = Math.max(1, Math.round(bitmap.width * scale));
  let height = Math.max(1, Math.round(bitmap.height * scale));
  let quality = 0.84;
  const canvas = document.createElement('canvas');

  for (let attempt = 0; attempt < 8; attempt += 1) {
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
    const dataUrl = await blobToDataUrl(await canvasToBlob(canvas, quality));
    if (dataUrl.length <= MAX_STORED_IMAGE_LENGTH) {
      bitmap.close?.();
      return dataUrl;
    }
    quality = Math.max(0.48, quality - 0.08);
    width = Math.max(480, Math.round(width * 0.82));
    height = Math.max(480, Math.round(height * 0.82));
  }

  bitmap.close?.();
  throw new Error('This photo is still too large after compression. Try a smaller copy.');
}

function AddEditModal({ photo, user, onClose, onSaved, onDeleted }) {
  const editing = Boolean(photo?.id && !photo.demo);
  const [form, setForm] = useState(editing ? { ...emptyForm, ...photo } : emptyForm);
  const [source, setSource] = useState(editing ? 'existing' : 'upload');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(photo?.imageUrl || '');
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  useEffect(() => () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
  }, [preview]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function chooseFile(nextFile) {
    if (!nextFile) return;
    if (!nextFile.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (nextFile.size > 20 * 1024 * 1024) {
      setError('That image is over 20 MB. Please choose a smaller copy.');
      return;
    }
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
    setError('');
  }

  async function imageFromUrl(url) {
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) throw new Error('Paste a complete http:// or https:// image link.');
    try {
      const response = await fetch(trimmed);
      if (!response.ok) throw new Error('Could not download that image.');
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) throw new Error('That link does not point to an image.');
      return { imageUrl: await compressImage(blob), externalUrl: false };
    } catch (fetchError) {
      return { imageUrl: trimmed, externalUrl: true, warning: fetchError.message };
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!form.person.trim()) {
      setError('Add the person’s name first.');
      return;
    }
    if (!editing && source === 'upload' && !file) {
      setError('Choose or drop a photo first.');
      return;
    }
    if (!editing && source === 'url' && !form.imageUrl.trim()) {
      setError('Paste an image URL first.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      let image = { imageUrl: form.imageUrl, externalUrl: form.sourceType === 'external-url' };
      if (file) image = { imageUrl: await compressImage(file), externalUrl: false };
      else if (!editing && source === 'url') image = await imageFromUrl(form.imageUrl);

      const payload = {
        person: form.person.trim(),
        group: form.group.trim(),
        type: form.type,
        note: form.note.trim(),
        focalX: Number(form.focalX),
        focalY: Number(form.focalY),
        imageUrl: image.imageUrl,
        sourceType: image.externalUrl ? 'external-url' : 'firestore-image',
      };

      if (editing) await changePhoto(photo.id, payload);
      else await createPhoto(payload);
      onSaved(image.warning);
    } catch (saveError) {
      setError(saveError.message || 'Could not save this photo. Please try again.');
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Remove this photo of ${photo.person}?`)) return;
    setSaving(true);
    try {
      await removePhoto(photo);
      onDeleted();
    } catch (deleteError) {
      setError(deleteError.message || 'Could not remove this photo.');
      setSaving(false);
    }
  }

  return (
    <Modal onClose={saving ? () => {} : onClose} className="editor-modal">
      <div className="modal-heading">
        <div>
          <p className="eyebrow">{editing ? 'Update the folder' : 'A new favorite'}</p>
          <h2>{editing ? 'Edit photo' : 'Add a photo'}</h2>
        </div>
        <IconButton label="Close" onClick={onClose} disabled={saving}><X size={19} /></IconButton>
      </div>

      <form className="editor-layout" onSubmit={handleSave}>
        <div className="image-editor">
          {!editing && (
            <div className="source-tabs" role="tablist" aria-label="Image source">
              <button type="button" className={source === 'upload' ? 'active' : ''} onClick={() => setSource('upload')}><Upload size={15} /> Upload</button>
              <button type="button" className={source === 'url' ? 'active' : ''} onClick={() => setSource('url')}><Images size={15} /> Paste URL</button>
            </div>
          )}

          {(source === 'upload' || editing) && !preview && (
            <button
              className={`drop-zone ${dragging ? 'dragging' : ''}`}
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}
            >
              <ImagePlus size={30} />
              <strong>Drop a photo here</strong>
              <span>or click to browse</span>
            </button>
          )}

          {source === 'url' && !editing && !preview && (
            <div className="url-panel">
              <Images size={28} />
              <label>
                <span>Image URL</span>
                <input type="url" value={form.imageUrl} onChange={(event) => update('imageUrl', event.target.value)} placeholder="https://…" />
              </label>
              <button className="secondary-button" type="button" onClick={() => form.imageUrl && setPreview(form.imageUrl)}>Preview photo</button>
            </div>
          )}

          {preview && (
            <div className="editor-preview">
              <img src={preview} alt="Preview" style={{ objectPosition: `${form.focalX}% ${form.focalY}%` }} onError={() => setError('That image could not be previewed. Check the URL or upload it instead.')} />
              <button type="button" onClick={() => { setPreview(''); setFile(null); }}><X size={15} /> Change</button>
            </div>
          )}

          <input ref={fileInput} hidden type="file" accept="image/*" onChange={(event) => chooseFile(event.target.files[0])} />

          {preview && (
            <div className="focal-controls">
              <label><span>Left ↔ right</span><input type="range" min="0" max="100" value={form.focalX} onChange={(event) => update('focalX', event.target.value)} /></label>
              <label><span>Top ↕ bottom</span><input type="range" min="0" max="100" value={form.focalY} onChange={(event) => update('focalY', event.target.value)} /></label>
            </div>
          )}
        </div>

        <div className="metadata-form">
          <label><span>Person <b>*</b></span><input autoFocus type="text" value={form.person} onChange={(event) => update('person', event.target.value)} placeholder="Song Mingi" /></label>
          <label><span>Group or affiliation</span><input type="text" value={form.group} onChange={(event) => update('group', event.target.value)} placeholder="ATEEZ" /></label>
          <label><span>Type</span><select value={form.type} onChange={(event) => update('type', event.target.value)}>{TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label><span>Note <small>optional</small></span><textarea value={form.note} onChange={(event) => update('note', event.target.value)} placeholder="That hair. That jacket. Enough said." rows="3" /></label>

          {error && <p className="form-error" role="alert">{error}</p>}
          {saving && <p className="saving-note">Preparing and saving your photo…</p>}

          <div className="form-actions">
            {editing && <button type="button" className="delete-button" onClick={handleDelete} disabled={saving}><Trash2 size={16} /> Remove</button>}
            <span className="action-spacer" />
            <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : null}{editing ? 'Save changes' : 'Add to folder'}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function PhotoDetail({ photo, canEdit, onClose, onEdit }) {
  return (
    <Modal onClose={onClose} className="detail-modal">
      <div className="detail-image"><PhotoVisual photo={photo} eager /></div>
      <div className="detail-copy">
        <IconButton label="Close" onClick={onClose}><X size={19} /></IconButton>
        <p className="eyebrow">{photo.type}</p>
        <h2>{photo.person}</h2>
        {photo.group && <p className="detail-group">{photo.group}</p>}
        {photo.note && <p className="detail-note">{photo.note}</p>}
        {canEdit && <button className="secondary-button edit-detail" type="button" onClick={onEdit}><Pencil size={15} /> Edit photo</button>}
      </div>
    </Modal>
  );
}

function LockedScreen({ user, onSignIn, onSignOut, authError }) {
  return (
    <main className="locked-screen">
      <div className="locked-folder" aria-hidden="true"><FolderHeart size={54} /></div>
      <p className="eyebrow">Private collection</p>
      <h1>Pretty People<br />Folder</h1>
      <p>Your very sensible place for extremely good-looking people.</p>
      {!firebaseReady ? (
        <div className="setup-card">
          <strong>Firebase isn’t connected yet.</strong>
          <span>Add your project values to <code>.env</code>, then reload.</span>
        </div>
      ) : user ? (
        <div className="setup-card">
          <strong>This Google account is not the owner.</strong>
          <span>{user.email}</span>
          {!ownerUid && <span className="uid-copy">Your UID: <code>{user.uid}</code></span>}
          <button className="secondary-button" type="button" onClick={onSignOut}><LogOut size={16} /> Try another account</button>
        </div>
      ) : (
        <button className="primary-button sign-in-button" type="button" onClick={onSignIn}><LogIn size={17} /> Continue with Google</button>
      )}
      {authError && <p className="form-error">{authError}</p>}
    </main>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(!firebaseReady);
  const [authError, setAuthError] = useState('');
  const [photos, setPhotos] = useState(firebaseReady ? [] : demoPhotos);
  const [loading, setLoading] = useState(firebaseReady);
  const [dataError, setDataError] = useState('');
  const [search, setSearch] = useState('');
  const [person, setPerson] = useState('');
  const [group, setGroup] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('album');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editorPhoto, setEditorPhoto] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [detailPhoto, setDetailPhoto] = useState(null);
  const [toast, setToast] = useState('');

  const isOwner = Boolean(user && ownerUid && user.uid === ownerUid);
  const canView = !privateMode || isOwner;

  useEffect(() => {
    if (!firebaseReady) return undefined;
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!firebaseReady || !authLoaded || !canView) {
      if (authLoaded) setLoading(false);
      return undefined;
    }
    setLoading(true);
    return watchPhotos(
      (nextPhotos) => { setPhotos(nextPhotos); setLoading(false); setDataError(''); },
      (error) => { setDataError(error.message || 'Could not load the folder.'); setLoading(false); },
    );
  }, [authLoaded, canView]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const counts = useMemo(() => {
    const map = new Map();
    photos.forEach((photo) => map.set(photo.person, (map.get(photo.person) || 0) + 1));
    return map;
  }, [photos]);

  const people = useMemo(() => [...counts.keys()].sort(), [counts]);
  const groups = useMemo(() => [...new Set(photos.map((photo) => photo.group).filter(Boolean))].sort(), [photos]);
  const mostSaved = useMemo(() => [...counts.entries()].sort((a, b) => b[1] - a[1])[0], [counts]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const next = photos.filter((photo) => {
      const searchable = [photo.person, photo.group, photo.type, photo.note].join(' ').toLowerCase();
      return (!needle || searchable.includes(needle))
        && (!person || photo.person === person)
        && (!group || photo.group === group)
        && (!type || photo.type === type);
    });

    return next.sort((a, b) => {
      if (sort === 'oldest') return timeValue(a.createdAt) - timeValue(b.createdAt);
      if (sort === 'person') return a.person.localeCompare(b.person) || (a.group || '').localeCompare(b.group || '');
      if (sort === 'group') return (a.group || 'ZZZ').localeCompare(b.group || 'ZZZ') || a.person.localeCompare(b.person);
      if (sort === 'most') return (counts.get(b.person) || 0) - (counts.get(a.person) || 0) || a.person.localeCompare(b.person);
      return timeValue(b.createdAt) - timeValue(a.createdAt);
    });
  }, [photos, search, person, group, type, sort, counts]);

  const activeFilters = [person, group, type].filter(Boolean).length;

  async function handleSignIn() {
    setAuthError('');
    try { await signInWithPopup(auth, provider); }
    catch (error) { setAuthError(error.message || 'Google sign-in did not finish.'); }
  }

  function openAdd() {
    setEditorPhoto(null);
    setEditorOpen(true);
  }

  function openEdit(photo) {
    setDetailPhoto(null);
    setEditorPhoto(photo);
    setEditorOpen(true);
  }

  function clearFilters() {
    setSearch(''); setPerson(''); setGroup(''); setType('');
  }

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return undefined;
    const lifecycle = new AbortController();
    Promise.resolve(context.registerTool({
      name: 'open_add_photo',
      title: 'Open Add Photo',
      description: 'Open the form for adding a new photo to Pretty People Folder.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async () => { openAdd(); return { status: 'form_opened' }; },
    }, { signal: lifecycle.signal })).catch(() => {});
    return () => lifecycle.abort();
  }, []);

  if (!authLoaded) return <div className="app-loading"><LoaderCircle className="spin" /><span>Opening your folder…</span></div>;
  if (firebaseReady && privateMode && !isOwner) return <LockedScreen user={user} onSignIn={handleSignIn} onSignOut={() => signOut(auth)} authError={authError} />;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><FolderHeart size={25} /></span>
          <div>
            <h1>Pretty People Folder</h1>
            <p>A very organized appreciation archive.</p>
          </div>
        </div>
        <div className="header-actions">
          {!firebaseReady && <span className="demo-pill">Preview data</span>}
          {firebaseReady && !user && <button className="quiet-button" type="button" onClick={handleSignIn}><LogIn size={16} /> Owner sign in</button>}
          {isOwner && <IconButton label="Sign out" onClick={() => signOut(auth)}><LogOut size={17} /></IconButton>}
          {isOwner && <button className="primary-button add-button" type="button" onClick={openAdd}><Plus size={17} /> Add photo</button>}
        </div>
      </header>

      <main>
        <section className="summary-row" aria-label="Folder summary">
          <Stat value={photos.length} label="photos" />
          <Stat value={people.length} label="people" />
          <Stat value={groups.length} label="groups" />
          <div className="favorite-stat">
            <span>Most saved</span>
            <strong>{mostSaved ? `${mostSaved[0]} · ${mostSaved[1]}` : '—'}</strong>
          </div>
        </section>

        <section className="controls" aria-label="Find and arrange photos">
          <label className="search-box">
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search a person, group, type, or note…" />
            {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}
          </label>

          <div className="control-row">
            <button className={`filter-button ${activeFilters ? 'active' : ''}`} type="button" onClick={() => setFiltersOpen((open) => !open)}>
              <SlidersHorizontal size={15} /> Filters {activeFilters ? <b>{activeFilters}</b> : null}
            </button>
            <label className="sort-control"><ArrowDownAZ size={15} /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort photos"><option value="newest">Newest added</option><option value="oldest">Oldest added</option><option value="person">Person A–Z</option><option value="group">Group A–Z</option><option value="most">Most saved person</option></select></label>
            <div className="view-switcher" aria-label="View style">
              <button type="button" className={view === 'album' ? 'active' : ''} onClick={() => setView('album')} title="Album"><Grid3X3 size={16} /><span>Album</span></button>
              <button type="button" className={view === 'wall' ? 'active' : ''} onClick={() => setView('wall')} title="Gallery wall"><Frame size={16} /><span>Wall</span></button>
              <button type="button" className={view === 'people' ? 'active' : ''} onClick={() => setView('people')} title="People"><UsersRound size={16} /><span>People</span></button>
            </div>
          </div>

          {filtersOpen && (
            <div className="filter-drawer">
              <FilterSelect label="Person" value={person} onChange={setPerson}><option value="">Everyone</option>{people.map((item) => <option key={item}>{item}</option>)}</FilterSelect>
              <FilterSelect label="Group" value={group} onChange={setGroup}><option value="">All groups</option>{groups.map((item) => <option key={item}>{item}</option>)}</FilterSelect>
              <FilterSelect label="Type" value={type} onChange={setType}><option value="">All types</option>{TYPES.map((item) => <option key={item}>{item}</option>)}</FilterSelect>
              {(activeFilters > 0) && <button className="clear-button" type="button" onClick={clearFilters}>Clear all</button>}
            </div>
          )}
        </section>

        {dataError && <div className="error-banner" role="alert">{dataError}</div>}
        {loading ? (
          <div className="content-loading"><LoaderCircle className="spin" /><span>Arranging the album…</span></div>
        ) : filtered.length === 0 ? (
          <section className="empty-state">
            <span><ImagePlus size={30} /></span>
            <h2>{photos.length ? 'Nothing matches that' : 'Your folder is waiting'}</h2>
            <p>{photos.length ? 'Try clearing a filter or searching for someone else.' : 'Add the first photo you couldn’t bear to leave in your camera roll.'}</p>
            {photos.length ? <button className="secondary-button" type="button" onClick={clearFilters}>Clear search and filters</button> : isOwner ? <button className="primary-button" type="button" onClick={openAdd}><Plus size={17} /> Add your first photo</button> : null}
          </section>
        ) : (
          <>
            <div className="results-line"><span>{filtered.length} {filtered.length === 1 ? 'photo' : 'photos'}</span>{person && <button type="button" onClick={() => setPerson('')}>{person} <X size={13} /></button>}</div>
            {view === 'album' && <AlbumView photos={filtered} onOpen={setDetailPhoto} />}
            {view === 'wall' && <WallView photos={filtered} onOpen={setDetailPhoto} />}
            {view === 'people' && <PeopleView photos={filtered} counts={counts} onChoose={(name) => { setPerson(name); setView('album'); }} />}
          </>
        )}
      </main>

      <footer><FolderHeart size={14} /> Filed with excellent judgment.</footer>

      {detailPhoto && <PhotoDetail photo={detailPhoto} canEdit={isOwner} onClose={() => setDetailPhoto(null)} onEdit={() => openEdit(detailPhoto)} />}
      {editorOpen && isOwner && <AddEditModal photo={editorPhoto} user={user} onClose={() => setEditorOpen(false)} onSaved={(warning) => { setEditorOpen(false); setToast(warning ? 'Photo saved. The original site blocked copying, so this one still uses its URL.' : 'Photo added to your folder.'); }} onDeleted={() => { setEditorOpen(false); setToast('Photo removed.'); }} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}


createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>,
);
