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
  orderBy, query, serverTimestamp, updateDoc, writeBatch,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDGsiSVg8NcSCw6Ciej3kQqrSyfNeGyUV4',
  authDomain: 'prettypeoplefolder.firebaseapp.com',
  projectId: 'prettypeoplefolder',
  messagingSenderId: '382579714831',
  appId: '1:382579714831:web:656337c8c04dfceadfac7a',
};

// Firebase UID for the only account allowed to open this private collection.
const ownerUid = 'h5uXn1HQm9btL4gZjVjAV22uiG52';
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

async function saveAlbumOrder(photoIds) {
  const batch = writeBatch(db);
  photoIds.forEach((id, albumOrder) => {
    batch.update(doc(db, PHOTOS_COLLECTION, id), {
      albumOrder,
    });
  });
  await batch.commit();
}

async function importPhotoBackup(items) {
  for (let start = 0; start < items.length; start += 8) {
    const batch = writeBatch(db);
    items.slice(start, start + 8).forEach((item) => {
      const safeId = typeof item.id === 'string' && item.id && !item.id.includes('/') ? item.id : null;
      const reference = safeId ? doc(db, PHOTOS_COLLECTION, safeId) : doc(collection(db, PHOTOS_COLLECTION));
      const data = { ...item };
      delete data.id;
      batch.set(reference, data);
    });
    await batch.commit();
  }
}

const APP_STYLES = ":root {\n  font-family: 'DM Sans', system-ui, sans-serif;\n  color: #f8f2ec;\n  background: #120e14;\n  font-synthesis: none;\n  --bg: #120e14;\n  --surface: #1c151f;\n  --surface-2: #251c29;\n  --surface-3: #2d2231;\n  --border: #3a2d3e;\n  --text: #f8f2ec;\n  --muted: #b3a5b8;\n  --faint: #766a7c;\n  --gold: #e6ad58;\n  --gold-soft: #f5cf8e;\n  --plum: #70435c;\n  --danger: #ee937d;\n  --shadow: 0 24px 70px rgba(0, 0, 0, .38);\n}\n\n* { box-sizing: border-box; }\n\nhtml { min-width: 320px; background: var(--bg); }\n\nbody {\n  margin: 0;\n  min-width: 320px;\n  min-height: 100vh;\n  background:\n    radial-gradient(circle at 15% -10%, rgba(112, 67, 92, .22), transparent 38rem),\n    radial-gradient(circle at 90% 0%, rgba(230, 173, 88, .08), transparent 28rem),\n    var(--bg);\n}\n\nbutton, input, select, textarea { font: inherit; }\nbutton { color: inherit; }\nbutton:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {\n  outline: 2px solid var(--gold);\n  outline-offset: 2px;\n}\nbutton:disabled { opacity: .55; cursor: not-allowed; }\n\n.app-shell { min-height: 100vh; }\n.modal-open { overflow: hidden; }\n\n.topbar {\n  position: sticky;\n  z-index: 20;\n  top: 0;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  padding: 1.15rem clamp(1rem, 3vw, 2.5rem);\n  border-bottom: 1px solid rgba(82, 65, 87, .75);\n  background: rgba(18, 14, 20, .86);\n  backdrop-filter: blur(18px);\n}\n\n.brand { display: flex; align-items: center; gap: .8rem; min-width: 0; }\n.brand-mark {\n  display: grid;\n  width: 2.8rem;\n  height: 2.8rem;\n  flex: 0 0 auto;\n  place-items: center;\n  color: #211519;\n  border-radius: .8rem;\n  background: linear-gradient(145deg, var(--gold-soft), var(--gold));\n  box-shadow: inset 0 1px rgba(255,255,255,.5), 0 9px 24px rgba(230,173,88,.15);\n}\n\n.brand h1, .locked-screen h1, .modal h2, .empty-state h2 {\n  margin: 0;\n  font-family: 'Fraunces', Georgia, serif;\n  font-weight: 600;\n}\n.brand h1 { font-size: clamp(1.3rem, 2.2vw, 1.75rem); line-height: 1.05; }\n.brand p { margin: .25rem 0 0; color: var(--muted); font-size: .78rem; font-style: italic; }\n.header-actions { display: flex; align-items: center; gap: .6rem; }\n\n.primary-button, .secondary-button, .quiet-button, .delete-button {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: .45rem;\n  min-height: 2.6rem;\n  padding: .68rem 1rem;\n  border-radius: 999px;\n  cursor: pointer;\n  font-weight: 700;\n  font-size: .86rem;\n}\n.primary-button { color: #24160d; border: 1px solid #f0bf70; background: linear-gradient(180deg, #f2bd69, #dea04a); box-shadow: 0 8px 24px rgba(230,173,88,.13); }\n.primary-button:hover { filter: brightness(1.05); transform: translateY(-1px); }\n.secondary-button { border: 1px solid var(--border); background: var(--surface-2); }\n.secondary-button:hover, .quiet-button:hover { background: var(--surface-3); }\n.quiet-button { color: var(--muted); border: 1px solid var(--border); background: transparent; }\n.delete-button { color: var(--danger); border: 1px solid rgba(238,147,125,.3); background: transparent; }\n.icon-button {\n  display: grid;\n  width: 2.55rem;\n  height: 2.55rem;\n  padding: 0;\n  place-items: center;\n  border: 1px solid var(--border);\n  border-radius: 50%;\n  background: var(--surface-2);\n  cursor: pointer;\n}\n.icon-button:hover { background: var(--surface-3); }\n.demo-pill { padding: .4rem .7rem; border: 1px solid rgba(230,173,88,.3); border-radius: 999px; color: var(--gold-soft); background: rgba(230,173,88,.1); font-size: .75rem; }\n\nmain { width: min(1240px, calc(100% - 2rem)); margin: 0 auto; padding: 1.5rem 0 4rem; }\n\n.summary-row {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(85px, 130px)) minmax(180px, 1fr);\n  gap: .7rem;\n  margin-bottom: 1rem;\n}\n.stat, .favorite-stat {\n  min-height: 5rem;\n  padding: .85rem 1rem;\n  border: 1px solid var(--border);\n  border-radius: 1rem;\n  background: linear-gradient(145deg, rgba(37,28,41,.92), rgba(28,21,31,.92));\n}\n.stat { display: flex; flex-direction: column; justify-content: center; }\n.stat strong { color: var(--gold-soft); font-family: 'Fraunces', serif; font-size: 1.55rem; font-weight: 600; line-height: 1; }\n.stat span, .favorite-stat span { margin-top: .3rem; color: var(--muted); font-size: .76rem; }\n.favorite-stat { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; text-align: right; }\n.favorite-stat strong { margin-top: .25rem; font-family: 'Fraunces', serif; font-size: 1.05rem; }\n\n.controls { padding: .8rem; border: 1px solid var(--border); border-radius: 1.15rem; background: rgba(28,21,31,.8); box-shadow: 0 12px 35px rgba(0,0,0,.12); }\n.search-box {\n  display: flex;\n  align-items: center;\n  gap: .65rem;\n  min-height: 3rem;\n  padding: 0 .9rem;\n  color: var(--muted);\n  border: 1px solid var(--border);\n  border-radius: .8rem;\n  background: var(--surface-2);\n}\n.search-box:focus-within { border-color: rgba(230,173,88,.65); box-shadow: 0 0 0 3px rgba(230,173,88,.08); }\n.search-box input { width: 100%; border: 0; outline: 0; color: var(--text); background: transparent; font-size: .95rem; }\n.search-box input::placeholder { color: #8d8091; }\n.search-box button { display: grid; padding: .25rem; border: 0; color: var(--muted); background: transparent; cursor: pointer; }\n\n.control-row { display: flex; align-items: center; gap: .6rem; margin-top: .7rem; }\n.filter-button, .sort-control, .view-switcher, .size-switcher { border: 1px solid var(--border); border-radius: 999px; background: var(--surface-2); }\n.filter-button { display: inline-flex; align-items: center; gap: .4rem; min-height: 2.4rem; padding: .55rem .85rem; cursor: pointer; }\n.filter-button.active { border-color: rgba(230,173,88,.45); }\n.filter-button b { display: grid; width: 1.25rem; height: 1.25rem; place-items: center; border-radius: 50%; color: #24160d; background: var(--gold); font-size: .7rem; }\n.sort-control { display: flex; align-items: center; gap: .35rem; min-height: 2.4rem; padding: 0 .35rem 0 .75rem; color: var(--muted); }\n.sort-control select, .filter-select select { border: 0; outline: 0; color: var(--text); background: transparent; cursor: pointer; }\n.sort-control select { min-height: 2.2rem; padding: 0 1.3rem 0 .2rem; font-size: .82rem; }\n.sort-control option, .filter-select option, .metadata-form option { color: var(--text); background: var(--surface-2); }\n.size-switcher { display: flex; margin-left: auto; padding: .2rem; }\n.view-switcher { display: flex; padding: .2rem; }\n.view-switcher button, .size-switcher button { display: inline-flex; align-items: center; justify-content: center; gap: .35rem; min-height: 2rem; padding: .42rem .7rem; border: 0; border-radius: 999px; color: var(--muted); background: transparent; cursor: pointer; font-size: .78rem; }\n.view-switcher button.active, .size-switcher button.active { color: #24160d; background: var(--gold); }\n\n.filter-drawer { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: end; gap: .75rem; margin-top: .8rem; padding: .85rem; border-top: 1px solid var(--border); }\n.filter-select { display: grid; gap: .3rem; }\n.filter-select span { color: var(--muted); font-size: .72rem; }\n.filter-select select { width: 100%; min-height: 2.45rem; padding: 0 .75rem; border: 1px solid var(--border); border-radius: .65rem; background: var(--surface); }\n.clear-button { min-height: 2.45rem; padding: 0 .65rem; border: 0; color: var(--gold-soft); background: transparent; cursor: pointer; font-size: .8rem; }\n\n.results-line { display: flex; align-items: center; justify-content: space-between; min-height: 2.6rem; margin-top: .7rem; color: var(--muted); font-size: .8rem; }\n.results-line em { margin-left: auto; color: var(--gold-soft); font-size: .73rem; font-style: normal; }\n.results-line button { display: inline-flex; align-items: center; gap: .3rem; padding: .35rem .6rem; border: 1px solid var(--border); border-radius: 999px; background: var(--surface-2); cursor: pointer; }\n\n.album-stack { display: grid; gap: 1.5rem; }\n.binder-page {\n  position: relative;\n  padding: 1.65rem 1.45rem 2rem 2.7rem;\n  border: 1px solid rgba(219,211,220,.16);\n  border-radius: .45rem 1rem 1rem .45rem;\n  background:\n    linear-gradient(115deg, rgba(255,255,255,.045), transparent 28%),\n    linear-gradient(160deg, rgba(217,223,225,.13), rgba(119,111,123,.045));\n  box-shadow: var(--shadow), inset 0 1px rgba(255,255,255,.13);\n  overflow: hidden;\n}\n.binder-page::after {\n  content: '';\n  position: absolute;\n  z-index: 3;\n  inset: 0;\n  pointer-events: none;\n  background: linear-gradient(110deg, transparent 7%, rgba(255,255,255,.075) 29%, transparent 43%);\n}\n.binder-rings { position: absolute; z-index: 5; left: -.2rem; top: 16%; bottom: 16%; display: flex; flex-direction: column; justify-content: space-around; }\n.binder-rings i { display: block; width: 2rem; height: .55rem; border: 2px solid #a99383; border-left: 0; border-radius: 0 999px 999px 0; background: linear-gradient(#e5d6c6, #8a776c); box-shadow: 2px 2px 5px rgba(0,0,0,.4); }\n.pocket-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(.65rem, 1.5vw, 1.15rem); }\n.album-pocket {\n  position: relative;\n  display: flex;\n  min-width: 0;\n  padding: clamp(.35rem, .8vw, .58rem);\n  flex-direction: column;\n  border: 1px solid rgba(230,226,234,.23);\n  border-radius: .42rem;\n  background: rgba(224,227,232,.07);\n  box-shadow: inset 0 0 0 1px rgba(255,255,255,.035), 0 8px 18px rgba(0,0,0,.2);\n  cursor: pointer;\n  text-align: left;\n  overflow: hidden;\n}\n.album-pocket::after { content: ''; position: absolute; z-index: 2; inset: 0; pointer-events: none; background: linear-gradient(125deg, rgba(255,255,255,.12), transparent 24%, transparent 70%, rgba(255,255,255,.04)); }\n.album-pocket:hover { border-color: rgba(230,173,88,.55); transform: translateY(-2px); }\n.album-pocket.reorderable { cursor: grab; touch-action: none; user-select: none; }\n.album-pocket.reorderable:active { cursor: grabbing; }\n.album-pocket.dragging { border-color: var(--gold); opacity: .42; transform: scale(.97); }\n.pocket-photo { position: relative; display: block; aspect-ratio: 4 / 5; border-radius: .28rem; background: #2d2231; overflow: hidden; }\n.drag-grip { position: absolute; z-index: 4; top: .4rem; left: .4rem; display: grid; width: 1.55rem; height: 1.55rem; place-items: center; border: 1px solid rgba(255,255,255,.23); border-radius: .45rem; color: white; background: rgba(15,10,16,.72); box-shadow: 0 3px 12px rgba(0,0,0,.32); font-size: .55rem; line-height: .42rem; letter-spacing: .06rem; pointer-events: none; }\n.pocket-photo img, .person-portrait img, .instax-photo img, .detail-image img { width: 100%; height: 100%; object-fit: cover; }\n.pocket-caption { display: grid; min-width: 0; padding: .55rem .15rem .15rem; }\n.pocket-caption strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: clamp(.76rem, 1.5vw, .98rem); }\n.pocket-caption small { overflow: hidden; margin-top: .1rem; color: var(--muted); text-overflow: ellipsis; white-space: nowrap; font-size: clamp(.65rem, 1.1vw, .74rem); }\n.empty-pocket { aspect-ratio: 4 / 6; cursor: default; opacity: .45; }\n.empty-pocket:hover { border-color: rgba(230,226,234,.23); transform: none; }\n.page-number { position: absolute; right: 1.2rem; bottom: .55rem; color: rgba(244,236,245,.4); font-family: 'Fraunces', serif; font-size: .72rem; }\n.photo-placeholder { display: grid; width: 100%; height: 100%; place-items: center; color: rgba(255,245,235,.9); background: radial-gradient(circle at 35% 25%, rgba(255,255,255,.14), transparent 35%), linear-gradient(145deg, var(--placeholder), #2b202d); }\n.photo-placeholder span { font-family: 'Fraunces', serif; font-size: clamp(1.4rem, 5vw, 3.2rem); letter-spacing: .08em; }\n\n.album-stack.density-comfortable .pocket-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: clamp(.5rem, 1.15vw, .85rem); }\n.album-stack.density-comfortable .binder-page { padding: 1.35rem 1.15rem 1.8rem 2.5rem; }\n.album-stack.density-compact .pocket-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: clamp(.35rem, .8vw, .62rem); }\n.album-stack.density-compact .binder-page { padding: 1.05rem .9rem 1.6rem 2.35rem; }\n.album-stack.density-compact .album-pocket { padding: .28rem; }\n.album-stack.density-compact .pocket-caption { padding: .35rem .06rem .08rem; }\n.album-stack.density-compact .pocket-caption strong { font-size: .72rem; }\n.album-stack.density-compact .pocket-caption small { font-size: .61rem; }\n\n.instax-gallery {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(205px, 1fr));\n  gap: .75rem;\n  padding: clamp(1rem, 2.5vw, 2rem);\n  border: 1px solid rgba(158,132,163,.18);\n  border-radius: .7rem;\n  background:\n    radial-gradient(circle at 18% 8%, rgba(255,255,255,.045), transparent 20rem),\n    radial-gradient(circle at 80% 60%, rgba(112,67,92,.12), transparent 28rem),\n    #19151b;\n  box-shadow: var(--shadow), inset 0 0 80px rgba(0,0,0,.18);\n}\n.instax-card {\n  position: relative;\n  display: flex;\n  min-width: 0;\n  padding: .62rem .62rem 1rem;\n  flex-direction: column;\n  align-self: stretch;\n  border: 0;\n  border-radius: .12rem;\n  color: #352f34;\n  background: linear-gradient(145deg, #fffefa, #eeeae3);\n  box-shadow: 0 9px 19px rgba(0,0,0,.34), inset 0 0 0 1px rgba(70,60,68,.08);\n  cursor: pointer;\n  transform: rotate(var(--tilt));\n  overflow: hidden;\n}\n.instax-card::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(135deg, rgba(255,255,255,.22), transparent 28%, rgba(80,65,75,.025)); }\n.instax-card:hover { z-index: 3; box-shadow: 0 16px 28px rgba(0,0,0,.42); transform: translateY(-4px) rotate(0deg); }\n.instax-photo { display: block; width: 100%; aspect-ratio: 4 / 5; flex: 0 0 auto; background: #c8c3c6; overflow: hidden; }\n.instax-caption { position: relative; z-index: 1; display: flex; min-height: 2.75rem; padding: .6rem .25rem .05rem; flex-direction: column; justify-content: center; text-align: left; }\n.instax-caption strong { overflow: hidden; font-family: 'Fraunces', Georgia, serif; font-size: .92rem; line-height: 1.15; text-overflow: ellipsis; white-space: nowrap; }\n.instax-caption small { overflow: hidden; margin-top: .14rem; color: #756d73; font-size: .65rem; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }\n\n.instax-gallery.density-comfortable { grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: .62rem; padding: 1.2rem; }\n.instax-gallery.density-compact { grid-template-columns: repeat(auto-fill, minmax(108px, 1fr)); gap: .48rem; padding: .8rem; }\n.instax-gallery.density-compact .instax-card { padding: .35rem .35rem .58rem; }\n.instax-gallery.density-compact .instax-caption { min-height: 2rem; padding: .38rem .1rem 0; }\n.instax-gallery.density-compact .instax-caption strong { font-size: .7rem; }\n.instax-gallery.density-compact .instax-caption small { font-size: .54rem; }\n\n.people-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }\n.person-card { display: grid; grid-template-columns: 5.2rem 1fr; gap: .9rem; align-items: center; padding: .65rem; border: 1px solid var(--border); border-radius: 1rem; background: linear-gradient(145deg, var(--surface-2), var(--surface)); cursor: pointer; text-align: left; }\n.person-card:hover { border-color: rgba(230,173,88,.45); transform: translateY(-2px); }\n.person-portrait { display: block; width: 5.2rem; aspect-ratio: 4 / 5; border-radius: .65rem; overflow: hidden; }\n.person-info { display: flex; min-width: 0; flex-direction: column; }\n.person-info strong { overflow: hidden; font-family: 'Fraunces', serif; font-size: 1.08rem; text-overflow: ellipsis; white-space: nowrap; }\n.person-info small { margin-top: .18rem; color: var(--muted); }\n.person-info em { margin-top: .7rem; color: var(--gold-soft); font-size: .78rem; font-style: normal; }\n\n.people-grid.density-comfortable { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: .75rem; }\n.people-grid.density-comfortable .person-card { grid-template-columns: 4.2rem 1fr; gap: .7rem; }\n.people-grid.density-comfortable .person-portrait { width: 4.2rem; }\n.people-grid.density-compact { grid-template-columns: repeat(auto-fill, minmax(128px, 1fr)); gap: .6rem; }\n.people-grid.density-compact .person-card { display: flex; padding: .48rem; flex-direction: column; align-items: stretch; gap: .45rem; border-radius: .75rem; }\n.people-grid.density-compact .person-portrait { width: 100%; border-radius: .48rem; }\n.people-grid.density-compact .person-info strong { font-size: .86rem; }\n.people-grid.density-compact .person-info small { overflow: hidden; font-size: .66rem; text-overflow: ellipsis; white-space: nowrap; }\n.people-grid.density-compact .person-info em { margin-top: .35rem; font-size: .68rem; }\n\n.empty-state, .content-loading { display: grid; min-height: 24rem; place-items: center; align-content: center; text-align: center; }\n.empty-state > span { display: grid; width: 4.3rem; height: 4.3rem; place-items: center; border: 1px solid rgba(230,173,88,.3); border-radius: 1.2rem; color: var(--gold); background: rgba(230,173,88,.08); }\n.empty-state h2 { margin-top: 1rem; font-size: 1.5rem; }\n.empty-state p { max-width: 32rem; margin: .55rem auto 1rem; color: var(--muted); }\n.content-loading { gap: .6rem; color: var(--muted); }\n.error-banner { margin: .8rem 0; padding: .8rem 1rem; border: 1px solid rgba(238,147,125,.3); border-radius: .8rem; color: #ffd6ce; background: rgba(238,147,125,.08); }\n\nfooter { display: flex; align-items: center; justify-content: center; gap: .35rem; padding: 1.5rem; color: var(--faint); font-size: .75rem; }\n\n.modal-backdrop { position: fixed; z-index: 100; inset: 0; display: grid; padding: 1rem; place-items: center; background: rgba(7,5,8,.78); backdrop-filter: blur(9px); overflow-y: auto; }\n.modal { width: min(900px, 100%); max-height: calc(100vh - 2rem); border: 1px solid var(--border); border-radius: 1.25rem; background: var(--surface); box-shadow: 0 35px 90px rgba(0,0,0,.65); overflow: auto; }\n.modal-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1.25rem 1.35rem; border-bottom: 1px solid var(--border); }\n.modal h2 { font-size: 1.65rem; }\n.eyebrow { margin: 0 0 .3rem; color: var(--gold); font-size: .68rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }\n.editor-layout { display: grid; grid-template-columns: minmax(280px, .9fr) minmax(320px, 1.1fr); }\n.image-editor { padding: 1.25rem; border-right: 1px solid var(--border); background: #161118; }\n.source-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: .35rem; margin-bottom: .8rem; padding: .25rem; border: 1px solid var(--border); border-radius: .8rem; background: var(--surface); }\n.source-tabs button { display: flex; align-items: center; justify-content: center; gap: .4rem; min-height: 2.25rem; border: 0; border-radius: .6rem; color: var(--muted); background: transparent; cursor: pointer; }\n.source-tabs button.active { color: #24160d; background: var(--gold); }\n.batch-panel { margin-bottom: .8rem; padding: .7rem; border: 1px solid var(--border); border-radius: .8rem; background: var(--surface); }\n.batch-heading { display: flex; align-items: center; justify-content: space-between; gap: .75rem; margin-bottom: .6rem; }\n.batch-heading strong { color: var(--muted); font-size: .72rem; }\n.batch-heading button { display: inline-flex; padding: .25rem .35rem; align-items: center; gap: .25rem; border: 0; color: var(--gold-soft); background: transparent; cursor: pointer; font-size: .7rem; }\n.batch-queue { display: flex; gap: .5rem; padding: .15rem .1rem .3rem; overflow-x: auto; scrollbar-width: thin; }\n.batch-item { position: relative; flex: 0 0 3.4rem; padding: .18rem; border: 1px solid transparent; border-radius: .55rem; }\n.batch-item.active { border-color: var(--gold); background: rgba(230,173,88,.08); }\n.batch-thumb { position: relative; display: block; width: 100%; aspect-ratio: 4 / 5; padding: 0; border: 0; border-radius: .38rem; background: #0c090d; cursor: pointer; overflow: hidden; }\n.batch-thumb img { width: 100%; height: 100%; object-fit: cover; }\n.batch-thumb span { position: absolute; left: .2rem; bottom: .2rem; display: grid; width: 1rem; height: 1rem; place-items: center; border-radius: 50%; color: white; background: rgba(15,10,16,.78); font-size: .56rem; }\n.batch-remove { position: absolute; z-index: 2; top: -.25rem; right: -.25rem; display: grid; width: 1.2rem; height: 1.2rem; padding: 0; place-items: center; border: 1px solid rgba(255,255,255,.22); border-radius: 50%; color: white; background: #493846; cursor: pointer; }\n.drop-zone { display: grid; width: 100%; min-height: 23rem; padding: 2rem; place-items: center; align-content: center; gap: .45rem; border: 1px dashed #68556e; border-radius: .9rem; color: var(--muted); background: rgba(112,67,92,.08); cursor: pointer; }\n.drop-zone strong { color: var(--text); }\n.drop-zone span { font-size: .82rem; }\n.drop-zone.dragging { border-color: var(--gold); color: var(--gold); background: rgba(230,173,88,.08); }\n.url-panel { display: grid; min-height: 23rem; padding: 2rem 1rem; place-items: center; align-content: center; gap: 1rem; color: var(--muted); }\n.url-panel label { display: grid; width: 100%; gap: .35rem; font-size: .78rem; }\n.url-panel input { width: 100%; }\n.editor-preview { position: relative; aspect-ratio: 4 / 5; max-height: 25rem; border-radius: .8rem; background: #0c090d; overflow: hidden; }\n.editor-preview img { width: 100%; height: 100%; object-fit: cover; }\n.editor-preview button { position: absolute; top: .65rem; right: .65rem; display: inline-flex; align-items: center; gap: .3rem; padding: .45rem .65rem; border: 1px solid rgba(255,255,255,.18); border-radius: 999px; background: rgba(15,10,16,.76); cursor: pointer; font-size: .75rem; backdrop-filter: blur(8px); }\n.open-crop-button { display: inline-flex; width: 100%; min-height: 2.7rem; margin-top: .8rem; padding: .65rem .8rem; align-items: center; justify-content: center; gap: .45rem; border: 1px solid var(--border); border-radius: .75rem; color: var(--text); background: var(--surface); cursor: pointer; }\n.open-crop-button:hover { border-color: rgba(230,173,88,.55); color: var(--gold-soft); }\n.crop-modal-backdrop { position: fixed; z-index: 230; inset: 0; display: grid; padding: 1rem; place-items: center; background: rgba(4,3,5,.84); backdrop-filter: blur(7px); }\n.crop-modal { width: min(560px, 100%); max-height: calc(100vh - 2rem); border: 1px solid #59465e; border-radius: 1.25rem; background: #211923; box-shadow: 0 34px 90px rgba(0,0,0,.72); overflow: auto; }\n.crop-modal-heading { display: flex; padding: 1rem 1.15rem; align-items: center; justify-content: space-between; }\n.crop-modal-heading h2 { font-size: 1.25rem; }\n.crop-modal-body { display: grid; padding: 0 1.15rem .8rem; place-items: center; }\n.crop-box-stage { position: relative; width: min(78vw, var(--crop-stage-width)); aspect-ratio: var(--image-aspect); border-radius: .35rem; background: #0c090d; touch-action: none; overflow: hidden; user-select: none; }\n.crop-box-stage > img { display: block; width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none; }\n.crop-shade { position: absolute; inset: 0; pointer-events: none; background: rgba(9,6,10,.2); }\n.crop-selection { position: absolute; z-index: 2; border: 2px dashed rgba(255,255,255,.94); cursor: move; touch-action: none; box-shadow: 0 0 0 9999px rgba(5,3,6,.18); }\n.crop-gold-outline { position: absolute; inset: 3px; border: 2px solid var(--gold); pointer-events: none; }\n.crop-handle { position: absolute; z-index: 3; width: .78rem; height: .78rem; padding: 0; border: 1px solid #6d646f; border-radius: .2rem; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.4); touch-action: none; }\n.crop-handle-nw { top: 0; left: 0; cursor: nwse-resize; transform: translate(-50%, -50%); }\n.crop-handle-n { top: 0; left: 50%; cursor: ns-resize; transform: translate(-50%, -50%); }\n.crop-handle-ne { top: 0; right: 0; cursor: nesw-resize; transform: translate(50%, -50%); }\n.crop-handle-e { top: 50%; right: 0; cursor: ew-resize; transform: translate(50%, -50%); }\n.crop-handle-se { right: 0; bottom: 0; cursor: nwse-resize; transform: translate(50%, 50%); }\n.crop-handle-s { bottom: 0; left: 50%; cursor: ns-resize; transform: translate(-50%, 50%); }\n.crop-handle-sw { bottom: 0; left: 0; cursor: nesw-resize; transform: translate(-50%, 50%); }\n.crop-handle-w { top: 50%; left: 0; cursor: ew-resize; transform: translate(-50%, -50%); }\n.crop-help { margin: .65rem 0 0; color: var(--muted); font-size: .69rem; text-align: center; }\n.crop-help strong { color: var(--gold); font-weight: 600; }\n.crop-modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; padding: .85rem 1.15rem 1.15rem; border-top: 1px solid var(--border); }\n.crop-modal-actions > button { justify-content: center; }\n.metadata-form { display: flex; padding: 1.35rem; flex-direction: column; gap: 1rem; }\n.batch-shared-note { margin: 0; padding: .7rem .8rem; border: 1px solid rgba(230,173,88,.25); border-radius: .7rem; color: var(--gold-soft); background: rgba(230,173,88,.07); font-size: .74rem; line-height: 1.45; }\n.metadata-form > label { display: grid; gap: .4rem; }\n.metadata-form > label > span, .autocomplete-field > label > span, .multi-value-field > label > span, .url-panel label span { color: var(--muted); font-size: .78rem; }\n.metadata-form b { color: var(--gold); }\n.metadata-form small { color: var(--faint); font-size: .7rem; }\n.metadata-form input, .metadata-form select, .metadata-form textarea, .url-panel input { padding: .72rem .8rem; border: 1px solid var(--border); border-radius: .7rem; outline: 0; color: var(--text); background: var(--surface-2); font-size: .92rem; }\n.metadata-form textarea { resize: vertical; line-height: 1.5; }\n.metadata-form input:focus, .metadata-form select:focus, .metadata-form textarea:focus, .url-panel input:focus { border-color: rgba(230,173,88,.6); }\n.autocomplete-field { display: grid; gap: .4rem; }\n.autocomplete-control { position: relative; }\n.autocomplete-control input { width: 100%; }\n.autocomplete-menu { position: absolute; z-index: 30; top: calc(100% + .35rem); right: 0; left: 0; display: grid; max-height: 14rem; padding: .35rem; border: 1px solid #59465e; border-radius: .75rem; background: #2a202d; box-shadow: 0 16px 36px rgba(0,0,0,.48); overflow-y: auto; }\n.autocomplete-menu button { min-height: 2.65rem; padding: .65rem .75rem; border: 0; border-radius: .55rem; color: var(--text); background: transparent; cursor: pointer; font: inherit; text-align: left; }\n.autocomplete-menu button:hover, .autocomplete-menu button:focus-visible { color: #27170d; background: var(--gold); outline: 0; }\n.multi-value-field { display: grid; gap: .4rem; }\n.multi-value-control { position: relative; display: grid; grid-template-columns: 1fr auto; gap: .4rem; }\n.multi-value-control input { width: 100%; min-width: 0; }\n.add-value-button { display: grid; width: 2.7rem; padding: 0; place-items: center; border: 1px solid var(--border); border-radius: .7rem; color: var(--gold-soft); background: var(--surface-2); cursor: pointer; }\n.add-value-button:hover { border-color: rgba(230,173,88,.55); background: var(--surface-3); }\n.multi-value-control .autocomplete-menu { right: 3.1rem; }\n.value-chips, .detail-chips { display: flex; flex-wrap: wrap; gap: .35rem; }\n.value-chips > span, .detail-chips > span { display: inline-flex; min-height: 1.75rem; padding: .3rem .55rem; align-items: center; gap: .25rem; border: 1px solid rgba(180,154,185,.22); border-radius: 999px; color: #e7dce9; background: rgba(112,67,92,.2); font-size: .72rem; }\n.value-chips button { display: grid; width: 1.1rem; height: 1.1rem; padding: 0; place-items: center; border: 0; border-radius: 50%; color: var(--muted); background: transparent; cursor: pointer; }\n.value-chips button:hover { color: white; background: rgba(255,255,255,.1); }\n.form-error { margin: 0; padding: .7rem .8rem; border-radius: .6rem; color: #ffd3c9; background: rgba(238,147,125,.1); font-size: .78rem; }\n.upload-progress { position: relative; height: 1.7rem; border: 1px solid var(--border); border-radius: 999px; background: var(--surface-2); overflow: hidden; }\n.upload-progress span { position: absolute; inset: 0 auto 0 0; background: rgba(230,173,88,.35); }\n.upload-progress small { position: relative; z-index: 1; display: grid; height: 100%; place-items: center; font-size: .7rem; }\n.form-actions { display: flex; align-items: center; gap: .55rem; margin-top: auto; padding-top: .4rem; }\n.action-spacer { flex: 1; }\n.spin { animation: spin .8s linear infinite; }\n@keyframes spin { to { transform: rotate(360deg); } }\n\n.detail-modal { display: grid; grid-template-columns: minmax(280px, 1.05fr) minmax(250px, .75fr); width: min(820px, 100%); overflow: hidden; }\n.detail-image { min-height: min(70vh, 670px); background: #0c090d; }\n.detail-copy { position: relative; display: flex; padding: 2rem; flex-direction: column; justify-content: center; }\n.detail-copy .icon-button { position: absolute; top: 1rem; right: 1rem; }\n.detail-copy h2 { font-size: clamp(1.8rem, 5vw, 2.8rem); line-height: 1; }\n.detail-group { margin: .55rem 0 0; color: var(--gold-soft); }\n.detail-event { margin: .45rem 0 0; color: var(--muted); font-size: .82rem; }\n.detail-date { margin: .45rem 0 .2rem; color: var(--muted); font-size: .78rem; }\n.detail-meta { display: grid; gap: .35rem; margin-top: .75rem; }\n.detail-meta > strong { color: var(--faint); font-size: .65rem; letter-spacing: .08em; text-transform: uppercase; }\n.detail-chips.folders > span { color: var(--gold-soft); border-color: rgba(230,173,88,.25); background: rgba(230,173,88,.08); }\n.detail-note { margin: 1.5rem 0; color: var(--muted); line-height: 1.6; }\n.photo-updated { margin: .8rem 0 0; color: var(--faint); font-size: .7rem; }\n.edit-detail { align-self: flex-start; margin-top: .5rem; }\n\n.locked-screen { display: flex; width: min(520px, calc(100% - 2rem)); min-height: 100vh; margin: 0 auto; padding: 3rem 1rem; flex-direction: column; align-items: center; justify-content: center; text-align: center; }\n.locked-folder { display: grid; width: 6.3rem; height: 6.3rem; margin-bottom: 1.35rem; place-items: center; border: 1px solid rgba(230,173,88,.36); border-radius: 1.7rem; color: var(--gold); background: linear-gradient(145deg, rgba(230,173,88,.14), rgba(112,67,92,.16)); box-shadow: 0 25px 70px rgba(0,0,0,.34); }\n.locked-screen h1 { font-size: clamp(2.7rem, 10vw, 4.5rem); line-height: .95; }\n.locked-screen > p:not(.eyebrow):not(.form-error) { max-width: 27rem; color: var(--muted); line-height: 1.55; }\n.sign-in-button { margin-top: 1.1rem; }\n.setup-card { display: grid; width: 100%; margin-top: 1rem; padding: 1rem; gap: .55rem; border: 1px solid var(--border); border-radius: 1rem; color: var(--muted); background: var(--surface); font-size: .85rem; }\n.setup-card strong { color: var(--text); }\n.setup-card .secondary-button { margin: .3rem auto 0; }\n.uid-copy code { word-break: break-all; }\n.app-loading { display: grid; min-height: 100vh; place-items: center; align-content: center; gap: .7rem; color: var(--muted); }\n.toast { position: fixed; z-index: 150; right: 1rem; bottom: 1rem; max-width: min(26rem, calc(100% - 2rem)); padding: .8rem 1rem; border: 1px solid rgba(230,173,88,.34); border-radius: .8rem; color: #fff2dc; background: rgba(42,31,39,.96); box-shadow: var(--shadow); font-size: .82rem; }\n\n@media (max-width: 760px) {\n  .topbar { align-items: flex-start; }\n  .brand p { display: none; }\n  .header-actions { gap: .4rem; }\n  .add-button { width: 2.55rem; padding: 0; }\n  .add-button svg { margin: 0; }\n  .add-button { font-size: 0; }\n  .demo-pill, .quiet-button { display: none; }\n  .quiet-button.backup-button { display: inline-flex; min-height: 2.35rem; padding: .5rem .68rem; font-size: .72rem; }\n  main { width: min(100% - 1rem, 1240px); padding-top: .75rem; }\n  .summary-row { grid-template-columns: repeat(3, 1fr); gap: .45rem; }\n  .stat { min-height: 4rem; padding: .65rem; }\n  .stat strong { font-size: 1.25rem; }\n  .favorite-stat { grid-column: 1 / -1; min-height: 3.4rem; align-items: flex-start; text-align: left; }\n  .favorite-stat strong { font-size: .95rem; }\n  .control-row { flex-wrap: wrap; }\n  .size-switcher { width: 100%; margin: .1rem 0 0; }\n  .view-switcher { width: 100%; }\n  .size-switcher button,\n  .view-switcher button { flex: 1; justify-content: center; }\n  .filter-drawer { grid-template-columns: 1fr; }\n  .binder-page { padding: 1rem .65rem 1.55rem 1.4rem; }\n  .binder-rings { left: -.45rem; }\n  .binder-rings i { width: 1.4rem; }\n  .pocket-grid { gap: .38rem; }\n  .album-pocket { padding: .25rem; }\n  .pocket-caption { padding: .38rem .05rem .08rem; }\n  .pocket-caption strong { font-size: .68rem; }\n  .pocket-caption small { font-size: .58rem; }\n  .album-stack.density-comfortable .pocket-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }\n  .album-stack.density-compact .pocket-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }\n  .album-stack.density-comfortable .binder-page,\n  .album-stack.density-compact .binder-page { padding: 1rem .65rem 1.55rem 1.4rem; }\n  .empty-pocket { aspect-ratio: 4 / 6.1; }\n  .instax-gallery { grid-template-columns: repeat(2, minmax(0, 1fr)); padding: .75rem; gap: .48rem; }\n  .instax-gallery.density-comfortable { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .42rem; padding: .65rem; }\n  .instax-gallery.density-compact { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .35rem; padding: .5rem; }\n  .modal-backdrop { padding: 0; place-items: stretch; overflow: hidden; }\n  .modal { width: 100%; height: 100dvh; max-height: 100dvh; border: 0; border-radius: 0; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }\n  .modal-heading { position: sticky; z-index: 50; top: 0; padding: .9rem 1rem; background: rgba(31,23,33,.94); backdrop-filter: blur(12px); }\n  .modal-heading h2 { font-size: 1.35rem; }\n  .editor-layout, .detail-modal { grid-template-columns: 1fr; }\n  .image-editor { padding: 1rem; border-right: 0; border-bottom: 1px solid var(--border); }\n  .drop-zone, .url-panel { min-height: 10.5rem; padding: 1.25rem; }\n  .editor-preview { width: min(100%, 22rem); max-height: none; margin: 0 auto; }\n  .metadata-form { padding: 1rem; gap: .9rem; }\n  .metadata-form input, .metadata-form select, .metadata-form textarea, .url-panel input { font-size: 16px; }\n  .autocomplete-menu { position: relative; top: auto; max-height: 11rem; margin-top: .35rem; }\n  .multi-value-control .autocomplete-menu { grid-column: 1 / -1; right: auto; margin-top: 0; }\n  .detail-image { min-height: 52vh; max-height: 58vh; }\n  .detail-copy { padding: 1.4rem; }\n  .form-actions { flex-wrap: wrap; }\n  .action-spacer { display: none; }\n  .form-actions > * { flex: 1; white-space: nowrap; }\n}\n\n@media (max-width: 420px) {\n  .brand-mark { width: 2.5rem; height: 2.5rem; }\n  .brand h1 { font-size: 1.12rem; }\n  .summary-row { gap: .35rem; }\n  .stat span { font-size: .67rem; }\n  .sort-control { flex: 1; }\n  .sort-control select { width: 100%; }\n  .pocket-caption small { display: none; }\n  .album-pocket { aspect-ratio: .7; }\n  .pocket-photo { flex: 1; aspect-ratio: auto; }\n  .people-grid { grid-template-columns: 1fr; }\n}\n\n@media (prefers-reduced-motion: no-preference) {\n  button, .album-pocket, .person-card, .instax-card { transition: .18s ease; }\n}\n";
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
  dateTaken: '',
  events: [],
  otherPeople: [],
  tags: [],
  folders: [],
  type: 'Idol',
  note: '',
  imageUrl: '',
  focalX: 50,
  focalY: 50,
  cropZoom: 1,
  cropX: null,
  cropY: null,
  cropWidth: null,
  cropHeight: null,
};

const MAX_STORED_IMAGE_LENGTH = 700_000;
const MAX_BATCH_PHOTOS = 10;

function timeValue(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value.seconds) return value.seconds * 1000;
  return new Date(value).getTime() || 0;
}

function dateValue(value) {
  const milliseconds = timeValue(value);
  return milliseconds ? new Date(milliseconds).toISOString() : null;
}

function formatUpdated(value) {
  const milliseconds = timeValue(value);
  if (!milliseconds) return 'Just now';
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(milliseconds));
}

function formatPhotoDate(value) {
  if (!value) return '';
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'long' }).format(parsed);
}

function cleanList(value) {
  const source = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(source.filter((item) => item != null).map((item) => String(item).trim()).filter(Boolean))];
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
      draggable="false"
      style={{
        objectPosition: `${photo.focalX ?? 50}% ${photo.focalY ?? 50}%`,
        transform: `scale(${photo.cropZoom ?? 1})`,
        transformOrigin: `${photo.focalX ?? 50}% ${photo.focalY ?? 50}%`,
      }}
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

function AutocompleteField({ id, label, required = false, value, onChange, suggestions, placeholder }) {
  const [open, setOpen] = useState(false);
  const needle = value.trim().toLowerCase();
  const matches = suggestions
    .filter((item) => (!needle || item.toLowerCase().includes(needle)) && item.toLowerCase() !== needle)
    .slice(0, 6);

  function choose(valueToUse) {
    onChange(valueToUse);
    setOpen(false);
  }

  return (
    <div className="autocomplete-field">
      <label htmlFor={id}><span>{label} {required && <b>*</b>}</span></label>
      <div className="autocomplete-control">
        <input
          id={id}
          type="text"
          autoComplete="off"
          value={value}
          onChange={(event) => { onChange(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder={placeholder}
        />
        {open && matches.length > 0 && (
          <div className="autocomplete-menu" role="listbox" aria-label={`${label} suggestions`}>
            {matches.map((item) => (
              <button type="button" role="option" key={item} onPointerDown={(event) => event.preventDefault()} onClick={() => choose(item)}>{item}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MultiValueField({ id, label, values, onChange, suggestions = [], placeholder }) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);
  const normalizedValues = cleanList(values);
  const needle = draft.trim().toLowerCase();
  const matches = suggestions
    .filter((item) => !normalizedValues.some((value) => value.toLowerCase() === item.toLowerCase()))
    .filter((item) => !needle || item.toLowerCase().includes(needle))
    .slice(0, 6);

  function add(rawValue) {
    const nextValue = String(rawValue || '').trim().replace(/,$/, '').trim();
    if (!nextValue) return;
    if (!normalizedValues.some((item) => item.toLowerCase() === nextValue.toLowerCase())) {
      onChange([...normalizedValues, nextValue]);
    }
    setDraft('');
    setOpen(false);
  }

  function remove(valueToRemove) {
    onChange(normalizedValues.filter((item) => item !== valueToRemove));
  }

  return (
    <div className="multi-value-field">
      <label htmlFor={id}><span>{label} <small>optional</small></span></label>
      {normalizedValues.length > 0 && (
        <div className="value-chips">
          {normalizedValues.map((item) => (
            <span key={item}>{item}<button type="button" onClick={() => remove(item)} aria-label={`Remove ${item}`}><X size={12} /></button></span>
          ))}
        </div>
      )}
      <div className="multi-value-control">
        <input
          id={id}
          type="text"
          autoComplete="off"
          value={draft}
          onChange={(event) => { setDraft(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => draft.trim() ? add(draft) : setOpen(false)}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ',') && draft.trim()) {
              event.preventDefault();
              add(draft);
            }
          }}
          placeholder={placeholder}
        />
        <button className="add-value-button" type="button" onClick={() => add(draft)} disabled={!draft.trim()} aria-label={`Add ${label}`}><Plus size={15} /></button>
        {open && matches.length > 0 && (
          <div className="autocomplete-menu" role="listbox" aria-label={`${label} suggestions`}>
            {matches.map((item) => (
              <button type="button" role="option" key={item} onPointerDown={(event) => event.preventDefault()} onClick={() => add(item)}>{item}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AlbumCard({ photo, onOpen, canReorder, dragging, onPointerDown, onPointerMove, onPointerUp }) {
  return (
    <button
      className={`album-pocket ${canReorder ? 'reorderable' : ''} ${dragging ? 'dragging' : ''}`}
      type="button"
      data-photo-id={photo.id}
      onClick={() => onOpen(photo)}
      onPointerDown={(event) => onPointerDown?.(event, photo.id)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      title={canReorder ? 'Drag to move this photo' : undefined}
    >
      <span className="pocket-photo">
        <PhotoVisual photo={photo} />
        {canReorder && <span className="drag-grip" aria-hidden="true">••<br />••</span>}
      </span>
      <span className="pocket-caption">
        <strong>{photo.person}</strong>
        <small>{photo.group || photo.type}</small>
      </span>
    </button>
  );
}

function AlbumView({ photos, onOpen, density, canReorder, onReorder }) {
  const [draggedId, setDraggedId] = useState('');
  const [orderedPhotos, setOrderedPhotos] = useState(photos);
  const orderedRef = useRef(photos);
  const draggedRef = useRef('');
  const movedRef = useRef(false);
  const pointerRef = useRef(null);
  const suppressOpenRef = useRef(false);
  const pageSize = density === 'compact' ? 20 : density === 'comfortable' ? 12 : PAGE_SIZE;

  useEffect(() => {
    if (draggedId) return;
    setOrderedPhotos(photos);
    orderedRef.current = photos;
  }, [photos, draggedId]);

  const pages = [];
  for (let index = 0; index < orderedPhotos.length; index += pageSize) {
    pages.push(orderedPhotos.slice(index, index + pageSize));
  }

  function startPointer(event, id) {
    if (!canReorder || event.button !== 0) return;
    draggedRef.current = id;
    movedRef.current = false;
    pointerRef.current = {
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function movePhotoTo(sourceId, targetId) {
    if (!sourceId || sourceId === targetId) return;
    const next = [...orderedRef.current];
    const sourceIndex = next.findIndex((photo) => photo.id === sourceId);
    const targetIndex = next.findIndex((photo) => photo.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    orderedRef.current = next;
    movedRef.current = true;
    setOrderedPhotos(next);
  }

  function movePointer(event) {
    const pointer = pointerRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;
    if (!pointer.active) {
      const distance = Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY);
      if (distance < 6) return;
      pointer.active = true;
      suppressOpenRef.current = true;
      setDraggedId(pointer.id);
    }
    event.preventDefault();
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('[data-photo-id]');
    if (target?.dataset.photoId) movePhotoTo(pointer.id, target.dataset.photoId);
  }

  function finishPointer(event) {
    const pointer = pointerRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;
    const wasActive = pointer.active;
    pointerRef.current = null;
    const changed = movedRef.current;
    setDraggedId('');
    draggedRef.current = '';
    movedRef.current = false;
    if (changed) onReorder(orderedRef.current);
    if (wasActive) window.setTimeout(() => { suppressOpenRef.current = false; }, 0);
  }

  function openPhoto(photo) {
    if (!suppressOpenRef.current) onOpen(photo);
  }

  return (
    <div className={`album-stack density-${density}`}>
      {pages.map((page, pageIndex) => (
        <section className="binder-page" key={`page-${page[0]?.id || pageIndex}`} aria-label={`Album page ${pageIndex + 1}`}>
          <div className="binder-rings" aria-hidden="true">
            <i /><i /><i />
          </div>
          <div className="pocket-grid">
            {Array.from({ length: pageSize }, (_, cellIndex) => {
              const photo = page[cellIndex];
              return photo
                ? <AlbumCard key={photo.id} photo={photo} onOpen={openPhoto} canReorder={canReorder} dragging={draggedId === photo.id} onPointerDown={startPointer} onPointerMove={movePointer} onPointerUp={finishPointer} />
                : <div className="album-pocket empty-pocket" key={`empty-${cellIndex}`} aria-hidden="true" />;
            })}
          </div>
          <span className="page-number">{String(pageIndex + 1).padStart(2, '0')}</span>
        </section>
      ))}
    </div>
  );
}

function InstaxGallery({ photos, onOpen, density }) {
  const tilts = [-0.45, 0.25, -0.15, 0.5, -0.3, 0.15, -0.4];
  return (
    <div className={`instax-gallery density-${density}`}>
      {photos.map((photo, index) => (
        <button
          className="instax-card"
          style={{ '--tilt': `${tilts[index % tilts.length]}deg` }}
          type="button"
          key={photo.id}
          onClick={() => onOpen(photo)}
        >
          <span className="instax-photo"><PhotoVisual photo={photo} /></span>
          <span className="instax-caption">
            <strong>{photo.person}</strong>
            <small>{photo.group || photo.type}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

function PeopleView({ photos, counts, onChoose, density }) {
  const people = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([person, count]) => ({ person, count, photo: photos.find((item) => item.person === person || cleanList(item.otherPeople).includes(person)) }));

  return (
    <div className={`people-grid density-${density}`}>
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

function droppedImageUrl(dataTransfer) {
  const uriList = dataTransfer.getData('text/uri-list')
    .split(/\r?\n/)
    .find((line) => line && !line.startsWith('#'));
  if (uriList) return uriList.trim();

  const html = dataTransfer.getData('text/html');
  if (html) {
    const imageSource = new DOMParser().parseFromString(html, 'text/html').querySelector('img')?.src;
    if (imageSource) return imageSource;
  }

  const plainText = dataTransfer.getData('text/plain').trim();
  return /^(https?:|data:image\/|blob:)/i.test(plainText) ? plainText : '';
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

function withSaveTimeout(promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) => window.setTimeout(
      () => reject(new Error('Firebase could not finish saving. Check that Cloud Firestore is created and its security rules are published.')),
      15000,
    )),
  ]);
}

async function compressImage(file) {
  const objectUrl = URL.createObjectURL(file);
  const sourceImage = new Image();

  try {
    await new Promise((resolve, reject) => {
      sourceImage.onload = resolve;
      sourceImage.onerror = () => reject(new Error('Could not decode this image. Try saving it as JPG or PNG first.'));
      sourceImage.src = objectUrl;
    });

    const sourceWidth = sourceImage.naturalWidth;
    const sourceHeight = sourceImage.naturalHeight;
    if (!sourceWidth || !sourceHeight) throw new Error('This image has invalid dimensions.');

    const aspectRatio = sourceWidth / sourceHeight;
    const maxDimension = 1200;
    let longestSide = Math.min(maxDimension, Math.max(sourceWidth, sourceHeight));
    let quality = 0.84;
    const canvas = document.createElement('canvas');

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const width = aspectRatio >= 1 ? longestSide : Math.max(1, Math.round(longestSide * aspectRatio));
      const height = aspectRatio >= 1 ? Math.max(1, Math.round(longestSide / aspectRatio)) : longestSide;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.clearRect(0, 0, width, height);
      context.drawImage(sourceImage, 0, 0, sourceWidth, sourceHeight, 0, 0, width, height);

      const dataUrl = await blobToDataUrl(await canvasToBlob(canvas, quality));
      if (dataUrl.length <= MAX_STORED_IMAGE_LENGTH) return dataUrl;

      quality = Math.max(0.48, quality - 0.08);
      longestSide = Math.max(420, Math.round(longestSide * 0.82));
    }

    throw new Error('This photo is still too large after compression. Try a smaller copy.');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function clampCrop(value) {
  return Math.max(0, Math.min(100, Number(value)));
}

function clampBetween(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

const CROP_HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

function CropModal({ src, current, onCancel, onSave }) {
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const [imageAspect, setImageAspect] = useState(0.8);
  const [crop, setCrop] = useState(() => {
    if ([current.cropX, current.cropY, current.cropWidth, current.cropHeight].every(Number.isFinite)) {
      return { x: current.cropX, y: current.cropY, w: current.cropWidth, h: current.cropHeight };
    }
    const w = Math.min(88, 100 / Math.max(1, Number(current.cropZoom) || 1));
    const h = Math.min(88, w);
    return {
      x: clampBetween((Number(current.focalX) || 50) - w / 2, 0, 100 - w),
      y: clampBetween((Number(current.focalY) || 50) - h / 2, 0, 100 - h),
      w,
      h,
    };
  });
  const hasSavedBox = [current.cropX, current.cropY, current.cropWidth, current.cropHeight].every(Number.isFinite);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onCancel]);

  function fitInitialCrop(ratio) {
    if (hasSavedBox) return;
    const targetRatio = 0.8;
    let width = Math.min(88, 100 / Math.max(1, Number(current.cropZoom) || 1));
    let height = width * ratio / targetRatio;
    if (height > 88) {
      height = 88;
      width = height * targetRatio / ratio;
    }
    setCrop({
      x: clampBetween((Number(current.focalX) || 50) - width / 2, 0, 100 - width),
      y: clampBetween((Number(current.focalY) || 50) - height / 2, 0, 100 - height),
      w: width,
      h: height,
    });
  }

  function startDrag(event, action, handle = '') {
    event.preventDefault();
    event.stopPropagation();
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      action,
      handle,
      crop: { ...crop },
      width: rect.width,
      height: rect.height,
    };
    stageRef.current.setPointerCapture(event.pointerId);
  }

  function moveCrop(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = ((event.clientX - drag.startX) / drag.width) * 100;
    const dy = ((event.clientY - drag.startY) / drag.height) * 100;
    if (drag.action === 'move') {
      setCrop({
        ...drag.crop,
        x: clampBetween(drag.crop.x + dx, 0, 100 - drag.crop.w),
        y: clampBetween(drag.crop.y + dy, 0, 100 - drag.crop.h),
      });
      return;
    }

    const cropRatio = imageAspect / 0.8;
    const start = drag.crop;
    const right = start.x + start.w;
    const bottom = start.y + start.h;
    const centerX = start.x + start.w / 2;
    const centerY = start.y + start.h / 2;
    const chooseDelta = (horizontal, vertical) => Math.abs(horizontal) >= Math.abs(vertical) ? horizontal : vertical;
    let width = start.w;
    let x = start.x;
    let y = start.y;

    if (drag.handle === 'e' || drag.handle === 'w') {
      width = drag.handle === 'e' ? start.w + dx : start.w - dx;
      const maximumWidth = Math.min(drag.handle === 'e' ? 100 - start.x : right, (centerY * 2) / cropRatio, ((100 - centerY) * 2) / cropRatio);
      width = clampBetween(width, 16, maximumWidth);
      x = drag.handle === 'e' ? start.x : right - width;
      y = centerY - (width * cropRatio) / 2;
    } else if (drag.handle === 'n' || drag.handle === 's') {
      const height = drag.handle === 's' ? start.h + dy : start.h - dy;
      const maximumHeight = Math.min(drag.handle === 's' ? 100 - start.y : bottom, centerX * 2 * cropRatio, (100 - centerX) * 2 * cropRatio);
      width = clampBetween(height, 16 * cropRatio, maximumHeight) / cropRatio;
      x = centerX - width / 2;
      y = drag.handle === 's' ? start.y : bottom - width * cropRatio;
    } else {
      const horizontal = drag.handle.includes('e') ? dx : -dx;
      const vertical = (drag.handle.includes('s') ? dy : -dy) / cropRatio;
      width = start.w + chooseDelta(horizontal, vertical);
      const maximumWidth = Math.min(
        drag.handle.includes('e') ? 100 - start.x : right,
        (drag.handle.includes('s') ? 100 - start.y : bottom) / cropRatio,
      );
      width = clampBetween(width, 16, maximumWidth);
      x = drag.handle.includes('e') ? start.x : right - width;
      y = drag.handle.includes('s') ? start.y : bottom - width * cropRatio;
    }
    setCrop({ x, y, w: width, h: width * cropRatio });
  }

  function stopDrag(event) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  return (
    <div className="crop-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section className="crop-modal" role="dialog" aria-modal="true" aria-labelledby="crop-title">
        <header className="crop-modal-heading">
          <h2 id="crop-title">Adjust photo crop</h2>
          <IconButton label="Close crop editor" onClick={onCancel}><X size={19} /></IconButton>
        </header>
        <div className="crop-modal-body">
          <div
            className="crop-box-stage"
            ref={stageRef}
            style={{ '--image-aspect': imageAspect, '--crop-stage-width': `${Math.min(520, window.innerHeight * 0.62 * imageAspect)}px` }}
            onPointerMove={moveCrop}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
          >
            <img
              src={src}
              alt="Full photo crop preview"
              draggable="false"
              onLoad={(event) => {
                const ratio = event.currentTarget.naturalWidth / event.currentTarget.naturalHeight;
                setImageAspect(ratio);
                fitInitialCrop(ratio);
              }}
            />
            <span className="crop-shade" aria-hidden="true" />
            <span
              className="crop-selection"
              style={{ left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.w}%`, height: `${crop.h}%` }}
              onPointerDown={(event) => startDrag(event, 'move')}
            >
              <span className="crop-gold-outline" aria-hidden="true" />
              {CROP_HANDLES.map((handle) => (
                <button
                  className={`crop-handle crop-handle-${handle}`}
                  type="button"
                  aria-label={`Resize crop ${handle}`}
                  key={handle}
                  onPointerDown={(event) => startDrag(event, 'resize', handle)}
                />
              ))}
            </span>
          </div>
          <p className="crop-help">Drag the box to move it · drag a handle to resize · <strong>gold outline</strong> is what appears on the card</p>
        </div>
        <footer className="crop-modal-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button>
          <button className="primary-button" type="button" onClick={() => onSave({
            cropX: crop.x,
            cropY: crop.y,
            cropWidth: crop.w,
            cropHeight: crop.h,
            focalX: crop.x + crop.w / 2,
            focalY: crop.y + crop.h / 2,
            cropZoom: clampBetween(100 / crop.w, 1, 4),
          })}>Save crop</button>
        </footer>
      </section>
    </div>
  );
}

function AddEditModal({ photo, user, people, groups, events, tags, folders, onClose, onSaved, onDeleted }) {
  const editing = Boolean(photo?.id && !photo.demo);
  const [form, setForm] = useState(() => editing ? {
    ...emptyForm,
    ...photo,
    events: cleanList(photo.events?.length ? photo.events : photo.event),
    otherPeople: cleanList(photo.otherPeople),
    tags: cleanList(photo.tags),
    folders: cleanList(photo.folders),
    dateTaken: String(photo.dateTaken || ''),
  } : { ...emptyForm });
  const [source, setSource] = useState(editing ? 'existing' : 'upload');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(photo?.imageUrl || '');
  const [batchItems, setBatchItems] = useState([]);
  const [activeBatchId, setActiveBatchId] = useState('');
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(null);
  const [error, setError] = useState('');
  const [cropOpen, setCropOpen] = useState(false);
  const fileInput = useRef(null);
  const ownedObjectUrls = useRef(new Set());

  useEffect(() => () => {
    ownedObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    ownedObjectUrls.current.clear();
  }, []);

  const activeBatchItem = batchItems.find((item) => item.id === activeBatchId) || batchItems[0] || null;
  const shownPreview = !editing && source === 'upload' ? activeBatchItem?.preview || '' : preview;
  const shownCrop = activeBatchItem || form;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function makeBatchItem(nextFile) {
    const objectUrl = URL.createObjectURL(nextFile);
    ownedObjectUrls.current.add(objectUrl);
    return {
      id: `${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`,
      file: nextFile,
      preview: objectUrl,
      focalX: 50,
      focalY: 50,
      cropZoom: 1,
      cropX: null,
      cropY: null,
      cropWidth: null,
      cropHeight: null,
    };
  }

  function chooseFiles(nextFiles) {
    const incoming = [...(nextFiles || [])];
    if (!incoming.length) return;
    const valid = incoming.filter((nextFile) => nextFile.type.startsWith('image/') && nextFile.size <= 20 * 1024 * 1024);
    if (!valid.length) {
      setError('Please choose image files under 20 MB each.');
      return;
    }

    if (editing) {
      const nextFile = valid[0];
      if (preview?.startsWith('blob:') && ownedObjectUrls.current.has(preview)) {
        URL.revokeObjectURL(preview);
        ownedObjectUrls.current.delete(preview);
      }
      const objectUrl = URL.createObjectURL(nextFile);
      ownedObjectUrls.current.add(objectUrl);
      setFile(nextFile);
      setPreview(objectUrl);
      setForm((current) => ({ ...current, focalX: 50, focalY: 50, cropZoom: 1, cropX: null, cropY: null, cropWidth: null, cropHeight: null }));
      setError('');
      return;
    }

    const availableSlots = MAX_BATCH_PHOTOS - batchItems.length;
    if (availableSlots <= 0) {
      setError(`You can upload up to ${MAX_BATCH_PHOTOS} photos at a time.`);
      return;
    }
    const accepted = valid.slice(0, availableSlots).map(makeBatchItem);
    setBatchItems((current) => [...current, ...accepted]);
    if (!activeBatchId && accepted[0]) setActiveBatchId(accepted[0].id);
    const skipped = incoming.length - accepted.length;
    setError(skipped > 0 ? `${skipped} ${skipped === 1 ? 'photo was' : 'photos were'} skipped because the batch limit is ${MAX_BATCH_PHOTOS} or the file was invalid.` : '');
  }

  function removeBatchItem(id) {
    const removed = batchItems.find((item) => item.id === id);
    if (removed?.preview && ownedObjectUrls.current.has(removed.preview)) {
      URL.revokeObjectURL(removed.preview);
      ownedObjectUrls.current.delete(removed.preview);
    }
    const remaining = batchItems.filter((item) => item.id !== id);
    setBatchItems(remaining);
    if (activeBatchId === id) setActiveBatchId(remaining[0]?.id || '');
  }

  function clearShownPhoto() {
    if (!editing && source === 'upload' && activeBatchItem) {
      removeBatchItem(activeBatchItem.id);
      return;
    }
    if (preview?.startsWith('blob:') && ownedObjectUrls.current.has(preview)) {
      URL.revokeObjectURL(preview);
      ownedObjectUrls.current.delete(preview);
    }
    setPreview('');
    setFile(null);
    if (source === 'url') update('imageUrl', '');
  }

  function updateActiveCrop(nextCrop) {
    if (!editing && source === 'upload' && activeBatchItem) {
      setBatchItems((current) => current.map((item) => item.id === activeBatchItem.id ? { ...item, ...nextCrop } : item));
    } else {
      setForm((current) => ({ ...current, ...nextCrop }));
    }
  }

  async function handleImageDrop(event) {
    event.preventDefault();
    setDragging(false);
    const droppedFiles = [...event.dataTransfer.files].filter((item) => item.type.startsWith('image/'));
    if (droppedFiles.length) {
      chooseFiles(droppedFiles);
      return;
    }

    const droppedUrl = droppedImageUrl(event.dataTransfer);
    if (!droppedUrl) {
      setError('That drag did not contain an image. Try dragging the image itself or choose it from your device.');
      return;
    }

    try {
      if (/^(data:image\/|blob:)/i.test(droppedUrl)) {
        const response = await fetch(droppedUrl);
        const blob = await response.blob();
        chooseFiles([new File([blob], 'dropped-photo', { type: blob.type || 'image/jpeg' })]);
        return;
      }
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
      setFile(null);
      setSource('url');
      setPreview(droppedUrl);
      setForm((current) => ({
        ...current,
        imageUrl: droppedUrl,
        focalX: 50,
        focalY: 50,
        cropZoom: 1,
        cropX: null,
        cropY: null,
        cropWidth: null,
        cropHeight: null,
      }));
      setError('');
    } catch {
      setError('I could not read that dragged image. Download it first, then drop the saved file here.');
    }
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
    if (!editing && source === 'upload' && !batchItems.length) {
      setError('Choose or drop at least one photo first.');
      return;
    }
    if (!editing && source === 'url' && !form.imageUrl.trim()) {
      setError('Paste an image URL first.');
      return;
    }

    setSaving(true);
    setSaveProgress(null);
    setError('');
    const completedIds = [];
    try {
      const sharedPayload = {
        person: form.person.trim(),
        group: form.group.trim(),
        dateTaken: form.dateTaken || '',
        events: cleanList(form.events),
        event: cleanList(form.events)[0] || '',
        otherPeople: cleanList(form.otherPeople).filter((name) => name.toLowerCase() !== form.person.trim().toLowerCase()),
        tags: cleanList(form.tags),
        folders: cleanList(form.folders),
        type: form.type,
        note: form.note.trim(),
      };
      const payloadFor = (crop, image, order) => ({
        ...sharedPayload,
        focalX: Number(crop.focalX ?? 50),
        focalY: Number(crop.focalY ?? 50),
        cropZoom: Number(crop.cropZoom || 1),
        cropX: Number.isFinite(crop.cropX) ? crop.cropX : null,
        cropY: Number.isFinite(crop.cropY) ? crop.cropY : null,
        cropWidth: Number.isFinite(crop.cropWidth) ? crop.cropWidth : null,
        cropHeight: Number.isFinite(crop.cropHeight) ? crop.cropHeight : null,
        albumOrder: order,
        imageUrl: image.imageUrl,
        sourceType: image.externalUrl ? 'external-url' : 'firestore-image',
      });

      if (editing) {
        let image = { imageUrl: form.imageUrl, externalUrl: form.sourceType === 'external-url' };
        if (file) image = { imageUrl: await compressImage(file), externalUrl: false };
        await withSaveTimeout(changePhoto(photo.id, payloadFor(form, image, photo.albumOrder ?? Date.now())));
        onSaved(image.warning, 1);
        return;
      }

      if (source === 'url') {
        setSaveProgress({ current: 1, total: 1 });
        const image = await imageFromUrl(form.imageUrl);
        await withSaveTimeout(createPhoto(payloadFor(form, image, Date.now())));
        onSaved(image.warning, 1);
        return;
      }

      const orderBase = Date.now();
      for (let index = 0; index < batchItems.length; index += 1) {
        const item = batchItems[index];
        setSaveProgress({ current: index + 1, total: batchItems.length });
        const image = { imageUrl: await compressImage(item.file), externalUrl: false };
        await withSaveTimeout(createPhoto(payloadFor(item, image, orderBase + index)));
        completedIds.push(item.id);
      }
      onSaved(null, batchItems.length);
    } catch (saveError) {
      if (completedIds.length) {
        const remaining = batchItems.filter((item) => !completedIds.includes(item.id));
        setBatchItems(remaining);
        setActiveBatchId(remaining[0]?.id || '');
        setError(`${completedIds.length} ${completedIds.length === 1 ? 'photo was' : 'photos were'} saved. ${saveError.message || 'The remaining photos could not be saved.'} You can retry the photos still shown.`);
      } else {
        setError(saveError.message || 'Could not save this photo. Please try again.');
      }
      setSaving(false);
      setSaveProgress(null);
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
          <h2>{editing ? 'Edit photo' : 'Add photos'}</h2>
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

          {!editing && source === 'upload' && batchItems.length > 0 && (
            <div className="batch-panel">
              <div className="batch-heading">
                <strong>{batchItems.length} of {MAX_BATCH_PHOTOS} selected</strong>
                {batchItems.length < MAX_BATCH_PHOTOS && <button type="button" onClick={() => fileInput.current?.click()}><Plus size={14} /> Add more</button>}
              </div>
              <div className="batch-queue" aria-label="Selected photos">
                {batchItems.map((item, index) => (
                  <div className={`batch-item ${item.id === activeBatchItem?.id ? 'active' : ''}`} key={item.id}>
                    <button className="batch-thumb" type="button" onClick={() => setActiveBatchId(item.id)} aria-label={`Edit photo ${index + 1}`}>
                      <img src={item.preview} alt="" />
                      <span>{index + 1}</span>
                    </button>
                    <button className="batch-remove" type="button" onClick={() => removeBatchItem(item.id)} aria-label={`Remove photo ${index + 1}`}><X size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(source === 'upload' || editing) && !shownPreview && (
            <button
              className={`drop-zone ${dragging ? 'dragging' : ''}`}
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
              onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; setDragging(true); }}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
              onDrop={handleImageDrop}
            >
              <ImagePlus size={30} />
              <strong>{editing ? 'Drop a photo here' : 'Drop photos here'}</strong>
              <span>{editing ? 'or click to browse' : `or select up to ${MAX_BATCH_PHOTOS} photos`}</span>
            </button>
          )}

          {source === 'url' && !editing && !shownPreview && (
            <div className="url-panel">
              <Images size={28} />
              <label>
                <span>Image URL</span>
                <input type="url" value={form.imageUrl} onChange={(event) => update('imageUrl', event.target.value)} placeholder="https://…" />
              </label>
              <button className="secondary-button" type="button" onClick={() => form.imageUrl && setPreview(form.imageUrl)}>Preview photo</button>
            </div>
          )}

          {shownPreview && (
            <div className="editor-preview">
              <img src={shownPreview} alt="Preview" style={{ objectPosition: `${shownCrop.focalX ?? 50}% ${shownCrop.focalY ?? 50}%`, transform: `scale(${shownCrop.cropZoom ?? 1})`, transformOrigin: `${shownCrop.focalX ?? 50}% ${shownCrop.focalY ?? 50}%` }} onError={() => setError('That image could not be previewed. Check the URL or upload it instead.')} />
              <button type="button" onClick={clearShownPhoto}><X size={15} /> {!editing && source === 'upload' ? 'Remove' : 'Change'}</button>
            </div>
          )}

          <input ref={fileInput} hidden type="file" accept="image/*" multiple={!editing} onChange={(event) => { chooseFiles(event.target.files); event.target.value = ''; }} />

          {shownPreview && (
            <button className="open-crop-button" type="button" onClick={() => setCropOpen(true)}><SlidersHorizontal size={15} /> Adjust crop{batchItems.length > 1 && !editing && source === 'upload' ? ` for photo ${batchItems.findIndex((item) => item.id === activeBatchItem?.id) + 1}` : ''}</button>
          )}
        </div>

        <div className="metadata-form">
          {!editing && source === 'upload' && batchItems.length > 1 && <p className="batch-shared-note">These details will be applied to all {batchItems.length} selected photos. Cropping is saved separately for each one.</p>}
          <AutocompleteField id="person-name" label="Person" required value={form.person} onChange={(value) => update('person', value)} suggestions={people} placeholder="Song Mingi" />
          <AutocompleteField id="group-name" label="Group or affiliation" value={form.group} onChange={(value) => update('group', value)} suggestions={groups} placeholder="ATEEZ" />
          <label><span>Date taken <small>optional</small></span><input type="date" value={form.dateTaken} onChange={(event) => update('dateTaken', event.target.value)} /></label>
          <MultiValueField id="photo-events" label="Events" values={form.events} onChange={(value) => update('events', value)} suggestions={events} placeholder="Type an event, then press +" />
          <MultiValueField id="other-people" label="Other people" values={form.otherPeople} onChange={(value) => update('otherPeople', value)} suggestions={people.filter((name) => name !== form.person)} placeholder="Add another person" />
          <MultiValueField id="photo-tags" label="Tags" values={form.tags} onChange={(value) => update('tags', value)} suggestions={tags} placeholder="Meme, funny, favorite…" />
          <MultiValueField id="photo-folders" label="Folders" values={form.folders} onChange={(value) => update('folders', value)} suggestions={folders} placeholder="Screenshot, sunglasses…" />
          <label><span>Type</span><select value={form.type} onChange={(event) => update('type', event.target.value)}>{TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label><span>Note <small>optional</small></span><textarea value={form.note} onChange={(event) => update('note', event.target.value)} placeholder="That hair. That jacket. Enough said." rows="3" /></label>

          {error && <p className="form-error" role="alert">{error}</p>}
          {saving && <p className="saving-note">{saveProgress ? `Preparing and uploading ${saveProgress.current} of ${saveProgress.total}…` : 'Preparing and saving your photo…'}</p>}

          <div className="form-actions">
            {editing && <button type="button" className="delete-button" onClick={handleDelete} disabled={saving}><Trash2 size={16} /> Remove</button>}
            <span className="action-spacer" />
            <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : null}{editing ? 'Save changes' : source === 'upload' && batchItems.length > 1 ? 'Add these photos' : 'Add this man'}</button>
          </div>
        </div>
      </form>
      {cropOpen && <CropModal src={shownPreview} current={shownCrop} onCancel={() => setCropOpen(false)} onSave={(nextCrop) => { updateActiveCrop(nextCrop); setCropOpen(false); }} />}
    </Modal>
  );
}

function PhotoDetail({ photo, canEdit, onClose, onEdit }) {
  const photoEvents = cleanList(photo.events?.length ? photo.events : photo.event);
  const otherPeople = cleanList(photo.otherPeople);
  const tags = cleanList(photo.tags);
  const folders = cleanList(photo.folders);
  return (
    <Modal onClose={onClose} className="detail-modal">
      <div className="detail-image"><PhotoVisual photo={photo} eager /></div>
      <div className="detail-copy">
        <IconButton label="Close" onClick={onClose}><X size={19} /></IconButton>
        <p className="eyebrow">{photo.type}</p>
        <h2>{photo.person}</h2>
        {photo.group && <p className="detail-group">{photo.group}</p>}
        {photo.dateTaken && <p className="detail-date">Taken {formatPhotoDate(photo.dateTaken)}</p>}
        {otherPeople.length > 0 && <div className="detail-meta"><strong>Also in this photo</strong><div className="detail-chips">{otherPeople.map((item) => <span key={item}>{item}</span>)}</div></div>}
        {photoEvents.length > 0 && <div className="detail-meta"><strong>Events</strong><div className="detail-chips">{photoEvents.map((item) => <span key={item}>{item}</span>)}</div></div>}
        {folders.length > 0 && <div className="detail-meta"><strong>Folders</strong><div className="detail-chips folders">{folders.map((item) => <span key={item}>{item}</span>)}</div></div>}
        {tags.length > 0 && <div className="detail-meta"><strong>Tags</strong><div className="detail-chips">{tags.map((item) => <span key={item}>#{item}</span>)}</div></div>}
        {photo.note && <p className="detail-note">{photo.note}</p>}
        <p className="photo-updated">Last updated {formatUpdated(photo.updatedAt || photo.createdAt)}</p>
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
  const [eventFilter, setEventFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [folderFilter, setFolderFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('album');
  const [density, setDensity] = useState(() => window.localStorage.getItem('pretty-people-density') || 'large');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editorPhoto, setEditorPhoto] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [detailPhoto, setDetailPhoto] = useState(null);
  const [toast, setToast] = useState('');
  const importInput = useRef(null);

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

  useEffect(() => {
    window.localStorage.setItem('pretty-people-density', density);
  }, [density]);

  const counts = useMemo(() => {
    const map = new Map();
    photos.forEach((photo) => {
      const names = cleanList([photo.person, ...cleanList(photo.otherPeople)]);
      names.forEach((name) => map.set(name, (map.get(name) || 0) + 1));
    });
    return map;
  }, [photos]);

  const people = useMemo(() => [...counts.keys()].sort(), [counts]);
  const groups = useMemo(() => [...new Set(photos.map((photo) => photo.group).filter(Boolean))].sort(), [photos]);
  const events = useMemo(() => [...new Set(photos.flatMap((photo) => cleanList(photo.events?.length ? photo.events : photo.event)))].sort(), [photos]);
  const tags = useMemo(() => [...new Set(photos.flatMap((photo) => cleanList(photo.tags)))].sort(), [photos]);
  const folders = useMemo(() => [...new Set(photos.flatMap((photo) => cleanList(photo.folders)))].sort(), [photos]);
  const mostSaved = useMemo(() => [...counts.entries()].sort((a, b) => b[1] - a[1])[0], [counts]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const next = photos.filter((photo) => {
      const photoPeople = cleanList([photo.person, ...cleanList(photo.otherPeople)]);
      const photoEvents = cleanList(photo.events?.length ? photo.events : photo.event);
      const photoTags = cleanList(photo.tags);
      const photoFolders = cleanList(photo.folders);
      const searchable = [photoPeople, photo.group, photoEvents, photoTags, photoFolders, photo.dateTaken, photo.type, photo.note].flat().join(' ').toLowerCase();
      return (!needle || searchable.includes(needle))
        && (!person || photoPeople.includes(person))
        && (!group || photo.group === group)
        && (!type || photo.type === type)
        && (!eventFilter || photoEvents.includes(eventFilter))
        && (!tagFilter || photoTags.includes(tagFilter))
        && (!folderFilter || photoFolders.includes(folderFilter));
    });

    return next.sort((a, b) => {
      if (sort === 'manual') {
        const aOrder = Number.isFinite(a.albumOrder) ? a.albumOrder : Number.MAX_SAFE_INTEGER;
        const bOrder = Number.isFinite(b.albumOrder) ? b.albumOrder : Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder || timeValue(b.createdAt) - timeValue(a.createdAt);
      }
      if (sort === 'oldest') return timeValue(a.createdAt) - timeValue(b.createdAt);
      if (sort === 'person') return a.person.localeCompare(b.person) || (a.group || '').localeCompare(b.group || '');
      if (sort === 'group') return (a.group || 'ZZZ').localeCompare(b.group || 'ZZZ') || a.person.localeCompare(b.person);
      if (sort === 'most') return (counts.get(b.person) || 0) - (counts.get(a.person) || 0) || a.person.localeCompare(b.person);
      return timeValue(b.createdAt) - timeValue(a.createdAt);
    });
  }, [photos, search, person, group, type, eventFilter, tagFilter, folderFilter, sort, counts]);

  const activeFilters = [person, group, type, eventFilter, tagFilter, folderFilter].filter(Boolean).length;
  const albumIsFiltered = Boolean(search.trim() || activeFilters);
  const canReorderAlbum = isOwner && view === 'album' && sort === 'manual';

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
    setSearch(''); setPerson(''); setGroup(''); setType(''); setEventFilter(''); setTagFilter(''); setFolderFilter('');
  }

  function exportFolder() {
    const backup = {
      app: 'Pretty People Folder',
      version: 2,
      exportedAt: new Date().toISOString(),
      photos: photos.filter((photo) => !photo.demo).map((photo) => ({
        ...photo,
        createdAt: dateValue(photo.createdAt),
        updatedAt: dateValue(photo.updatedAt),
      })),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pretty-people-folder-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast(`${backup.photos.length} photos exported.`);
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const imported = Array.isArray(parsed) ? parsed : parsed.photos;
      if (!Array.isArray(imported) || !imported.length) throw new Error('That file does not contain a Pretty People Folder backup.');
      const prepared = imported.map((photo, index) => {
        if (!photo?.person || !photo?.imageUrl) throw new Error(`Photo ${index + 1} is missing a person or image.`);
        const createdAt = photo.createdAt && !Number.isNaN(new Date(photo.createdAt).getTime()) ? new Date(photo.createdAt) : new Date();
        const updatedAt = photo.updatedAt && !Number.isNaN(new Date(photo.updatedAt).getTime()) ? new Date(photo.updatedAt) : createdAt;
        return {
          id: photo.id,
          person: String(photo.person).trim(),
          group: String(photo.group || '').trim(),
          dateTaken: /^\d{4}-\d{2}-\d{2}$/.test(String(photo.dateTaken || '')) ? String(photo.dateTaken) : '',
          events: cleanList(photo.events?.length ? photo.events : photo.event),
          event: cleanList(photo.events?.length ? photo.events : photo.event)[0] || '',
          otherPeople: cleanList(photo.otherPeople),
          tags: cleanList(photo.tags),
          folders: cleanList(photo.folders),
          type: TYPES.includes(photo.type) ? photo.type : 'Other',
          note: String(photo.note || '').trim(),
          imageUrl: String(photo.imageUrl),
          sourceType: photo.sourceType === 'external-url' ? 'external-url' : 'firestore-image',
          focalX: clampCrop(photo.focalX ?? 50),
          focalY: clampCrop(photo.focalY ?? 50),
          cropZoom: Math.max(1, Math.min(4, Number(photo.cropZoom) || 1)),
          cropX: Number.isFinite(photo.cropX) ? clampCrop(photo.cropX) : null,
          cropY: Number.isFinite(photo.cropY) ? clampCrop(photo.cropY) : null,
          cropWidth: Number.isFinite(photo.cropWidth) ? clampBetween(photo.cropWidth, 1, 100) : null,
          cropHeight: Number.isFinite(photo.cropHeight) ? clampBetween(photo.cropHeight, 1, 100) : null,
          albumOrder: Number.isFinite(photo.albumOrder) ? photo.albumOrder : index,
          createdAt,
          updatedAt,
        };
      });
      if (!window.confirm(`Import ${prepared.length} photos? Photos with matching backup IDs will be updated.`)) return;
      setToast('Importing your folder…');
      await importPhotoBackup(prepared);
      setToast(`${prepared.length} photos imported.`);
    } catch (error) {
      setDataError(error.message || 'Could not import that backup.');
      setToast('Import failed.');
    }
  }

  async function reorderAlbum(nextPhotos) {
    const visibleIds = new Set(nextPhotos.map((photo) => photo.id));
    const completeOrder = [...photos]
      .sort((a, b) => {
        const aOrder = Number.isFinite(a.albumOrder) ? a.albumOrder : Number.MAX_SAFE_INTEGER;
        const bOrder = Number.isFinite(b.albumOrder) ? b.albumOrder : Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder || timeValue(b.createdAt) - timeValue(a.createdAt);
      });
    let visibleIndex = 0;
    const mergedOrder = completeOrder.map((photo) => visibleIds.has(photo.id) ? nextPhotos[visibleIndex++] : photo);
    const nextOrder = new Map(mergedOrder.map((photo, index) => [photo.id, index]));
    setPhotos((current) => current.map((photo) => nextOrder.has(photo.id) ? { ...photo, albumOrder: nextOrder.get(photo.id) } : photo));
    setToast('Saving your album order…');
    try {
      await withSaveTimeout(saveAlbumOrder(mergedOrder.map((photo) => photo.id)));
      setToast('Album order saved.');
    } catch (error) {
      setDataError(error.message || 'Could not save the album order.');
      setToast('Album order could not be saved.');
    }
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
          {isOwner && <button className="quiet-button backup-button" type="button" onClick={exportFolder}>Export</button>}
          {isOwner && <button className="quiet-button backup-button" type="button" onClick={() => importInput.current?.click()}>Import</button>}
          <input ref={importInput} hidden type="file" accept="application/json,.json" onChange={handleImport} />
          {isOwner && <IconButton label="Sign out" onClick={() => signOut(auth)}><LogOut size={17} /></IconButton>}
          {isOwner && <button className="primary-button add-button" type="button" onClick={openAdd}><Plus size={17} /> Add photos</button>}
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
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people, events, tags, folders, or notes…" />
            {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}
          </label>

          <div className="control-row">
            <button className={`filter-button ${activeFilters ? 'active' : ''}`} type="button" onClick={() => setFiltersOpen((open) => !open)}>
              <SlidersHorizontal size={15} /> Filters {activeFilters ? <b>{activeFilters}</b> : null}
            </button>
            <label className="sort-control"><ArrowDownAZ size={15} /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort photos"><option value="manual">Custom order (drag)</option><option value="newest">Newest added</option><option value="oldest">Oldest added</option><option value="person">Person A–Z</option><option value="group">Group A–Z</option><option value="most">Most saved person</option></select></label>
            <div className="size-switcher" aria-label="Photo size">
              <button type="button" className={density === 'compact' ? 'active' : ''} onClick={() => setDensity('compact')}>Compact</button>
              <button type="button" className={density === 'comfortable' ? 'active' : ''} onClick={() => setDensity('comfortable')}>Comfortable</button>
              <button type="button" className={density === 'large' ? 'active' : ''} onClick={() => setDensity('large')}>Large</button>
            </div>
            <div className="view-switcher" aria-label="View style">
              <button type="button" className={view === 'album' ? 'active' : ''} onClick={() => setView('album')} title="Album"><Grid3X3 size={16} /><span>Album</span></button>
              <button type="button" className={view === 'wall' ? 'active' : ''} onClick={() => setView('wall')} title="Instax gallery"><Frame size={16} /><span>Gallery</span></button>
              <button type="button" className={view === 'people' ? 'active' : ''} onClick={() => setView('people')} title="People"><UsersRound size={16} /><span>People</span></button>
            </div>
          </div>

          {filtersOpen && (
            <div className="filter-drawer">
              <FilterSelect label="Person" value={person} onChange={setPerson}><option value="">Everyone</option>{people.map((item) => <option key={item}>{item}</option>)}</FilterSelect>
              <FilterSelect label="Group" value={group} onChange={setGroup}><option value="">All groups</option>{groups.map((item) => <option key={item}>{item}</option>)}</FilterSelect>
              <FilterSelect label="Type" value={type} onChange={setType}><option value="">All types</option>{TYPES.map((item) => <option key={item}>{item}</option>)}</FilterSelect>
              <FilterSelect label="Event" value={eventFilter} onChange={setEventFilter}><option value="">All events</option>{events.map((item) => <option key={item}>{item}</option>)}</FilterSelect>
              <FilterSelect label="Tag" value={tagFilter} onChange={setTagFilter}><option value="">All tags</option>{tags.map((item) => <option key={item}>{item}</option>)}</FilterSelect>
              <FilterSelect label="Folder" value={folderFilter} onChange={setFolderFilter}><option value="">All folders</option>{folders.map((item) => <option key={item}>{item}</option>)}</FilterSelect>
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
            <div className="results-line">
              <span>{filtered.length} {filtered.length === 1 ? 'photo' : 'photos'}</span>
              {view === 'album' && sort === 'manual' && <em>{albumIsFiltered ? 'Drag to rearrange the matching photos' : 'Drag photos to rearrange the album'}</em>}
              {person && <button type="button" onClick={() => setPerson('')}>{person} <X size={13} /></button>}
            </div>
            {view === 'album' && <AlbumView photos={filtered} onOpen={setDetailPhoto} density={density} canReorder={canReorderAlbum} onReorder={reorderAlbum} />}
            {view === 'wall' && <InstaxGallery photos={filtered} onOpen={setDetailPhoto} density={density} />}
            {view === 'people' && <PeopleView photos={filtered} counts={counts} density={density} onChoose={(name) => { setPerson(name); setView('album'); }} />}
          </>
        )}
      </main>

      <footer><FolderHeart size={14} /> Filed with excellent judgment.</footer>

      {detailPhoto && <PhotoDetail photo={detailPhoto} canEdit={isOwner} onClose={() => setDetailPhoto(null)} onEdit={() => openEdit(detailPhoto)} />}
      {editorOpen && isOwner && <AddEditModal photo={editorPhoto} user={user} people={people} groups={groups} events={events} tags={tags} folders={folders} onClose={() => setEditorOpen(false)} onSaved={(warning, count = 1) => { setEditorOpen(false); setToast(warning ? 'Photo saved. The original site blocked copying, so this one still uses its URL.' : count > 1 ? `${count} photos added to your folder.` : editorPhoto ? 'Photo updated.' : 'Photo added to your folder.'); }} onDeleted={() => { setEditorOpen(false); setToast('Photo removed.'); }} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}


createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>,
);
