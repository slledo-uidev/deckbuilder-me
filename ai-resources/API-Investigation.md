# DigimonCard.dev API Investigation

**Date:** March 16, 2026  
**Investigator:** LledoSL  
**Purpose:** Research DigimonCard.dev API for deck builder integration

---

## Key Findings

### 1. Source Information

**Primary Application:**
- **URL:** https://digimoncard.dev
- **GitHub Repository:** https://github.com/TakaOtaku/Digimon-Card-App
- **License:** MIT License (open source)
- **Tech Stack:** Angular 17+, NGRX, PrimeNG, TailwindCSS, Firebase
- **Card Count:** 8,095+ cards (confirmed in functional document)

### 2. Data Synchronization

**Card Data Source:**
- **Primary Source:** DigimonCardGame.Fandom Wiki
- **Synchronization Method:** Python script (WikiVariables.py) in `scripts/python/`
- **Update Frequency:** Daily automated workflow (last update: 2 weeks ago based on GitHub commits)
- **Storage:** Firebase Firestore database

**Python Script:** `scripts/python/WikiVariables.py`
- Scrapes card data from Fandom wiki
- Updates Firebase database
- Runs via GitHub Actions workflow

### 3. Available Endpoints (To Be Confirmed)

Based on the website structure, potential public endpoints:
- `https://digimoncard.dev/api` - returns main page (no JSON API response)
- `https://digimoncard.dev/api-public` - returns main page (no JSON API response)
- `https://digimoncard.dev/api-public/search.php` - needs testing with parameters

**Note:** Initial fetch attempts returned HTML pages, not JSON APIs. This suggests:
1. API endpoints may require specific query parameters
2. API might be Firebase-based requiring Firebase SDK
3. Data might be served through Firebase Realtime Database or Firestore

### 4. Alternative Data Access Methods

**Option A: Firebase Public Access (if available)**
- The app uses Firebase for backend
- Check if Firebase database has public read access
- Look for Firebase config in the source code

**Option B: Static JSON Export**
- Clone the GitHub repository
- Check `src/assets/` for static card JSON files
- Repository has card data that gets compiled into the app

**Option C: Web Scraping (Last Resort)**
- Parse the digimoncard.dev card library pages
- Use the search functionality to retrieve card data
- **Note:** This should be a fallback only, with rate limiting and respect for server

**Option D: Build From Source**
- Clone the Digimon-Card-App repository
- Extract card data JSON files from their assets
- Use their WikiVariables.py script to fetch latest data from Fandom

### 5. Card Data Structure (From GitHub Repository Analysis)

Based on the application repository, cards likely have this structure:
```typescript
{
  "cardNumber": "BT1-001",  // Unique ID
  "name": "Koromon",
  "color": ["Red"],
  "type": "Digi-Egg",
  "playCost": 0,
  "digivolveCost": null,
  "level": 2,
  "dp": 0,
  "form": "In-Training",
  "attribute": "None",
  "rarity": "Common",
  "set": "BT-01 New Evolution",
  "effect": "[Your Turn] When this Digimon digivolves...",
  "inheritedEffect": "...",
  "securityEffect": null,
  "image": "https://assets.orangeswim.dev/cards/...",
  "keywords": []
}
```

### 6. Image Assets

**CDN:** `https://assets.orangeswim.dev/`
- Cards stored as WebP/PNG images
- Path pattern: `https://assets.orangeswim.dev/cards/[set]/[cardNumber].webp`
- Set images: `https://assets.orangeswim.dev/other/[set].webp`

**Usage Notice (from privacy policy):**
> "Do not redistribute images from DigimonCard.dev. Do not link directly to the images from the site. You may use the images for your personal use and content."

**Recommendation:** Host our own copies of card images or request permission from @OrangeswimDev

### 7. Rate Limiting & Terms

**From Privacy Policy:**
- Uses Google Analytics and browser storage
- No explicit API rate limits documented
- Requests to support official Digimon TCG releases

**Ethical Considerations:**
- Respect server resources
- Implement client-side caching (IndexedDB)
- Consider donating via PayPal if using their infrastructure
- Contact maintainer (@TakaOtaku / TakaOtaku#8538 on Discord) for API access

### 8. Discord Community

**Digimon TCG 2020 Discord:** https://discord.gg/yXsuBJs
- Active community (8,095 card reference implies size)
- Potential to ask about API access
- Maintainer might provide official API documentation

---

## Recommended Implementation Strategy

### Phase 0 (Current) - API Research
1. ✅ Research completed - found GitHub repository and data sources
2. 🔄 **Next:** Test Firebase endpoints or clone repository for card data
3. **Next:** Contact maintainer for API guidance

### MVP Approach (Short-term)
**Option: Static JSON File**
- Clone Digimon-Card-App repository
- Extract card data from their assets or use their Python script
- Store as static JSON in `src/assets/data/cards.json`
- Pros: Fast, reliable, offline-capable
- Cons: Manual updates needed, larger bundle size

**Implementation:**
```typescript
// card.service.ts
public getAllCards(): Observable<Card[]> {
  return this.http.get<Card[]>('assets/data/cards.json').pipe(
    tap(cards => {
      // Cache in IndexedDB
      this.indexedDbService.saveCards(cards);
      this.cardsCache$.next(cards);
    })
  );
}
```

### Long-term Approach
**Option: Firebase Integration**
- If DigimonCard.dev provides Firebase config for read-only access
- Use AngularFire to connect directly to their Firestore
- Real-time updates when new cards are added
- Requires permission from maintainer

**Option: Own Backend**
- Run WikiVariables.py script ourselves
- Scrape from Fandom wiki (with proper rate limiting)
- Store in our own Firebase/database
- Full control, but maintenance overhead

---

## Action Items

### Immediate (Phase 0 Continuation)
- [x] Research DigimonCard.dev and data sources
- [ ] Clone Digimon-Card-App repository locally
- [ ] Check for public Firebase read access
- [ ] Extract sample card data for testing
- [ ] Contact @OrangeswimDev via Discord for API guidance

### For MVP (Phase 1)
- [ ] Decide on data source: static JSON vs API vs Firebase
- [ ] Implement card fetching in CardService
- [ ] Set up IndexedDB caching with Dexie.js
- [ ] Test with 100-200 card subset first
- [ ] Implement full 8,095+ card loading with progress indicator

### Post-MVP
- [ ] Investigate automated updates (if using static JSON)
- [ ] Consider hosting our own card images (with permission)
- [ ] Monitor for new card releases and update process

---

## Test Endpoints (To Try)

```bash
# Test potential API endpoints
curl https://digimoncard.dev/api-public/getAllCards.php
curl https://digimoncard.dev/api-public/search.php?query=greymon
curl https://digimoncard.dev/api-public/getCard.php?id=BT1-085

# Check Firebase config (from browser DevTools Network tab)
# Look for requests to firebaseio.com or firestore.googleapis.com
```

---

## Resources

- **GitHub Repo:** https://github.com/TakaOtaku/Digimon-Card-App
- **Python Script:** https://github.com/TakaOtaku/Digimon-Card-App/blob/main/scripts/python/WikiVariables.py
- **Fandom Wiki:** https://digimoncardgame.fandom.com/
- **Discord:** https://discord.gg/yXsuBJs
- **Maintainer:** @TakaOtaku (Discord: TakaOtaku#8538)
- **PayPal Donation:** https://www.paypal.com/donate/?hosted_button_id=DHQVT7GQ72J98

---

## Conclusion

**Recommended Path Forward:**
1. Clone the Digimon-Card-App repository to extract card data
2. Use their JSON or run WikiVariables.py to get latest data
3. Store as static JSON for MVP (fast, reliable, no API dependencies)
4. Implement IndexedDB caching in CardService
5. Post-MVP: Contact maintainer about official API or Firebase read access

**Decision:** For MVP, we'll use **static JSON approach** to unblock Phase 1 development. This gives us:
- Immediate access to 8,095+ cards
- No API rate limit concerns
- Offline capability
- Fast development velocity
- Can migrate to API/Firebase later if made available

**Next Steps:** Create sample card data file and test CardService integration.
