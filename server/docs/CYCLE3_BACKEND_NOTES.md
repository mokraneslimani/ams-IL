# Cycle 3 - Backend Notes (CoWatch)

Ce document resume les evolutions backend realisees pour la phase Cycle 3.

## 1) Stabilite et securite Socket.IO
- Gestion robuste des rooms: `join_room`, `leave_room`, `close_room`, `disconnect`.
- Reaffectation automatique de l'hote si deconnexion.
- Verification d'appartenance a la room avant diffusion des evenements.
- Validation des payloads Socket (roomId, ids, content, currentTime).

## 2) Annotations - API et droits
- Validation stricte des parametres (`roomId`, `annotationId`, `userId`, `videoUrl`, `timecodeSec`, `content`).
- Endpoint de modification ajoute:
  - `PATCH /api/annotations/:roomId/:annotationId`
  - Autorisation: auteur de l'annotation ou owner de la room.
- Suppression securisee maintenue:
  - `DELETE /api/annotations/:roomId/:annotationId`
  - Autorisation: auteur ou owner.
- Anti doublon a la creation (fenetre courte) pour limiter les doubles clics.

## 3) Filtrage et pagination annotations
GET `/api/annotations/:roomId` supporte:
- `videoUrl` (obligatoire)
- `limit` (1..1000)
- `offset` (>= 0)
- `cursor` ou `cursorId` (id > cursor)
- `authorId`
- `fromSec`
- `toSec`

## 4) Resynchronisation apres reconnexion
Nouveaux evenements Socket:
- `annotation_sync_request`
- `annotation_sync_snapshot`
- `annotation_sync_error`

Usage:
- un client peut demander un snapshot des annotations d'une video dans une room,
- utile apres reconnexion ou entree tardive.

## 5) Anti-spam temps reel
- Rate limit `chat_message`.
- Rate limit `annotation_created`.
- Garde anti-duplication de diffusion sur `annotation_created`.
- Evenement de retour: `rate_limited`.

## 6) Performance DB
Migration ajoutee:
- `server/migrations/05_annotations_cycle3_indexes.sql`

Index principaux:
- `(room_id, video_url, timecode_sec, id)`
- `(room_id, user_id, created_at DESC)`
- `(room_id, video_url, created_at DESC)`
- `(room_id, video_url, id)`

## 7) Tests backend automatises
Fichiers:
- `server/tests/annotationService.test.js`
- `server/tests/socketHandler.test.js`

Commande:
```bash
npm test
```

Statut actuel:
- 7 tests passants.

## Risques leves
- Robustesse des droits sur suppression/modification d'annotations.
- Validation backend plus stricte des entrees API/Socket.
- Reprise de coherence annotations apres reconnexion.
- Reduction des doublons et du spam en temps reel.

## Risques residuels
- Auth forte Socket (token/handshake) encore perfectible.
- Charge tres elevee: necessite de tests de charge reels multi-clients.
- Monitoring/alerting production non implemente dans ce lot.
