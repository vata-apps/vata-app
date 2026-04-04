import type Database from '@tauri-apps/plugin-sql';
import { openTreeDb, closeTreeDb } from '../connection';
import { createTree, updateTreeStats } from '../system/trees';
import { createIndividual } from '../trees/individuals';
import { createName } from '../trees/names';
import { createFamily, addFamilyMember } from '../trees/families';
import { createPlace } from '../trees/places';
import { createEvent, addEventParticipant, getEventTypeByTag } from '../trees/events';

import { appDataDir } from '@tauri-apps/api/path';

const DEMO_SLUG = 'harry-potter-family';

export async function seedHarryPotterDemo(systemDb: Database): Promise<void> {
  // Check if already seeded
  const rows = await systemDb.select<{ value: string }[]>(
    "SELECT value FROM app_settings WHERE key = 'demo_tree_seeded'",
    []
  );
  if (rows.length > 0 && rows[0].value === 'true') return;

  // Create tree entry in system DB
  const baseDir = await appDataDir();
  const treePath = `${baseDir}trees/${DEMO_SLUG}`;

  const treeId = await createTree({
    name: 'Harry Potter Family',
    path: treePath,
    description: 'A demo family tree featuring the extended Potter-Weasley family',
  });

  // Open tree DB
  await openTreeDb(treePath);

  // --- Places ---
  const godricsHollow = await createPlace({
    name: "Godric's Hollow",
    fullName: "Godric's Hollow, West Country, England",
  });
  const burrow = await createPlace({
    name: 'The Burrow',
    fullName: 'The Burrow, Ottery St Catchpole, Devon, England',
  });
  const privetDrive = await createPlace({
    name: '4 Privet Drive',
    fullName: '4 Privet Drive, Little Whinging, Surrey, England',
  });
  const hogwarts = await createPlace({
    name: 'Hogwarts',
    fullName: 'Hogwarts School of Witchcraft and Wizardry, Scotland',
  });

  // --- Resolve event types ---
  const birtType = await getEventTypeByTag('BIRT');
  const deatType = await getEventTypeByTag('DEAT');
  const marrType = await getEventTypeByTag('MARR');
  if (!birtType || !deatType || !marrType) {
    throw new Error('System event types not found');
  }

  // --- Helper functions ---
  async function createPerson(
    gender: 'M' | 'F',
    isLiving: boolean,
    givenNames: string,
    surname: string,
    marriedSurname?: string
  ): Promise<string> {
    const id = await createIndividual({ gender, isLiving });
    await createName({
      individualId: id,
      type: 'birth',
      givenNames,
      surname,
      isPrimary: true,
    });
    if (marriedSurname) {
      await createName({
        individualId: id,
        type: 'married',
        givenNames,
        surname: marriedSurname,
      });
    }
    return id;
  }

  async function addBirth(
    individualId: string,
    dateOriginal: string,
    dateSort: string,
    placeId?: string
  ): Promise<void> {
    const eventId = await createEvent({
      eventTypeId: birtType!.id,
      dateOriginal,
      dateSort,
      placeId,
    });
    await addEventParticipant({ eventId, individualId, role: 'principal' });
  }

  async function addDeath(
    individualId: string,
    dateOriginal: string,
    dateSort: string,
    placeId?: string
  ): Promise<void> {
    const eventId = await createEvent({
      eventTypeId: deatType!.id,
      dateOriginal,
      dateSort,
      placeId,
    });
    await addEventParticipant({ eventId, individualId, role: 'principal' });
  }

  async function addMarriage(
    familyId: string,
    dateOriginal?: string,
    dateSort?: string,
    placeId?: string
  ): Promise<void> {
    const eventId = await createEvent({
      eventTypeId: marrType!.id,
      dateOriginal,
      dateSort,
      placeId,
    });
    await addEventParticipant({ eventId, familyId, role: 'principal' });
  }

  // =========================================================================
  // Individuals (35)
  // =========================================================================

  // 1. Fleamont Potter
  const fleamont = await createPerson('M', false, 'Fleamont', 'Potter');
  // 2. Euphemia Potter
  const euphemia = await createPerson('F', false, 'Euphemia', 'Potter');
  // 3. James Potter
  const james = await createPerson('M', false, 'James', 'Potter');
  // 4. Lily Potter (née Evans)
  const lily = await createPerson('F', false, 'Lily', 'Evans', 'Potter');
  // 5. Harry James Potter
  const harry = await createPerson('M', true, 'Harry James', 'Potter');
  // 6. Ginny Potter (née Weasley)
  const ginny = await createPerson('F', true, 'Ginny', 'Weasley', 'Potter');
  // 7. James Sirius Potter
  const jamesSirius = await createPerson('M', true, 'James Sirius', 'Potter');
  // 8. Albus Severus Potter
  const albusSeverus = await createPerson('M', true, 'Albus Severus', 'Potter');
  // 9. Lily Luna Potter
  const lilyLuna = await createPerson('F', true, 'Lily Luna', 'Potter');
  // 10. Mr. Evans
  const mrEvans = await createPerson('M', false, 'Mr.', 'Evans');
  // 11. Mrs. Evans
  const mrsEvans = await createPerson('F', false, 'Mrs.', 'Evans');
  // 12. Petunia Dursley (née Evans)
  const petunia = await createPerson('F', true, 'Petunia', 'Evans', 'Dursley');
  // 13. Vernon Dursley
  const vernon = await createPerson('M', true, 'Vernon', 'Dursley');
  // 14. Dudley Dursley
  const dudley = await createPerson('M', true, 'Dudley', 'Dursley');
  // 15. Arthur Weasley
  const arthur = await createPerson('M', true, 'Arthur', 'Weasley');
  // 16. Molly Weasley (née Prewett)
  const molly = await createPerson('F', true, 'Molly', 'Prewett', 'Weasley');
  // 17. Bill Weasley
  const bill = await createPerson('M', true, 'Bill', 'Weasley');
  // 18. Fleur Weasley (née Delacour)
  const fleur = await createPerson('F', true, 'Fleur', 'Delacour', 'Weasley');
  // 19. Victoire Weasley
  const victoire = await createPerson('F', true, 'Victoire', 'Weasley');
  // 20. Dominique Weasley
  const dominique = await createPerson('F', true, 'Dominique', 'Weasley');
  // 21. Louis Weasley
  const louis = await createPerson('M', true, 'Louis', 'Weasley');
  // 22. Charlie Weasley
  const charlie = await createPerson('M', true, 'Charlie', 'Weasley');
  // 23. Percy Weasley
  const percy = await createPerson('M', true, 'Percy', 'Weasley');
  // 24. Audrey Weasley
  const audrey = await createPerson('F', true, 'Audrey', 'Weasley');
  // 25. Molly Weasley II
  const mollyII = await createPerson('F', true, 'Molly', 'Weasley');
  // 26. Lucy Weasley
  const lucy = await createPerson('F', true, 'Lucy', 'Weasley');
  // 27. Fred Weasley
  const fred = await createPerson('M', false, 'Fred', 'Weasley');
  // 28. George Weasley
  const george = await createPerson('M', true, 'George', 'Weasley');
  // 29. Angelina Weasley (née Johnson)
  const angelina = await createPerson('F', true, 'Angelina', 'Johnson', 'Weasley');
  // 30. Fred Weasley II
  const fredII = await createPerson('M', true, 'Fred', 'Weasley');
  // 31. Roxanne Weasley
  const roxanne = await createPerson('F', true, 'Roxanne', 'Weasley');
  // 32. Ron Weasley
  const ron = await createPerson('M', true, 'Ron', 'Weasley');
  // 33. Hermione Granger-Weasley
  const hermione = await createPerson('F', true, 'Hermione', 'Granger', 'Granger-Weasley');
  // 34. Rose Granger-Weasley
  const rose = await createPerson('F', true, 'Rose', 'Granger-Weasley');
  // 35. Hugo Granger-Weasley
  const hugo = await createPerson('M', true, 'Hugo', 'Granger-Weasley');

  // =========================================================================
  // Birth events
  // =========================================================================

  // James Potter — 27 Mar 1960
  await addBirth(james, '27 MAR 1960', '1960-03-27');
  // Lily Evans — 30 Jan 1960
  await addBirth(lily, '30 JAN 1960', '1960-01-30');
  // Harry Potter — 31 Jul 1980, Godric's Hollow
  await addBirth(harry, '31 JUL 1980', '1980-07-31', godricsHollow);
  // Ginny Weasley — 11 Aug 1981, The Burrow
  await addBirth(ginny, '11 AUG 1981', '1981-08-11', burrow);
  // James Sirius — ABT 2004
  await addBirth(jamesSirius, 'ABT 2004', '2004');
  // Albus Severus — ABT 2006
  await addBirth(albusSeverus, 'ABT 2006', '2006');
  // Lily Luna — ABT 2008
  await addBirth(lilyLuna, 'ABT 2008', '2008');
  // Petunia — ABT 1959
  await addBirth(petunia, 'ABT 1959', '1959');
  // Dudley — 23 Jun 1980
  await addBirth(dudley, '23 JUN 1980', '1980-06-23', privetDrive);
  // Arthur — 6 Feb 1950
  await addBirth(arthur, '6 FEB 1950', '1950-02-06');
  // Molly — 30 Oct 1949
  await addBirth(molly, '30 OCT 1949', '1949-10-30');
  // Bill — 29 Nov 1970
  await addBirth(bill, '29 NOV 1970', '1970-11-29');
  // Charlie — 12 Dec 1972
  await addBirth(charlie, '12 DEC 1972', '1972-12-12');
  // Percy — 22 Aug 1976
  await addBirth(percy, '22 AUG 1976', '1976-08-22');
  // Fred — 1 Apr 1978
  await addBirth(fred, '1 APR 1978', '1978-04-01');
  // George — 1 Apr 1978
  await addBirth(george, '1 APR 1978', '1978-04-01');
  // Ron — 1 Mar 1980
  await addBirth(ron, '1 MAR 1980', '1980-03-01', burrow);
  // Hermione — 19 Sep 1979
  await addBirth(hermione, '19 SEP 1979', '1979-09-19');
  // Victoire — 2 May 2000
  await addBirth(victoire, '2 MAY 2000', '2000-05-02');
  // Dominique — ABT 2002
  await addBirth(dominique, 'ABT 2002', '2002');
  // Louis — ABT 2004
  await addBirth(louis, 'ABT 2004', '2004');
  // Rose — ABT 2006
  await addBirth(rose, 'ABT 2006', '2006');
  // Hugo — ABT 2008
  await addBirth(hugo, 'ABT 2008', '2008');

  // =========================================================================
  // Death events
  // =========================================================================

  // Fleamont — ABT 1979
  await addDeath(fleamont, 'ABT 1979', '1979');
  // Euphemia — ABT 1979
  await addDeath(euphemia, 'ABT 1979', '1979');
  // James — 31 Oct 1981, Godric's Hollow
  await addDeath(james, '31 OCT 1981', '1981-10-31', godricsHollow);
  // Lily — 31 Oct 1981, Godric's Hollow
  await addDeath(lily, '31 OCT 1981', '1981-10-31', godricsHollow);
  // Fred — 2 May 1998, Hogwarts
  await addDeath(fred, '2 MAY 1998', '1998-05-02', hogwarts);

  // =========================================================================
  // Families (10) + Marriage events
  // =========================================================================

  // F1: Fleamont + Euphemia → James
  const f1 = await createFamily({});
  await addFamilyMember({ familyId: f1, individualId: fleamont, role: 'husband' });
  await addFamilyMember({ familyId: f1, individualId: euphemia, role: 'wife' });
  await addFamilyMember({ familyId: f1, individualId: james, role: 'child', pedigree: 'birth' });
  await addMarriage(f1);

  // F2: Mr. Evans + Mrs. Evans → Lily, Petunia
  const f2 = await createFamily({});
  await addFamilyMember({ familyId: f2, individualId: mrEvans, role: 'husband' });
  await addFamilyMember({ familyId: f2, individualId: mrsEvans, role: 'wife' });
  await addFamilyMember({ familyId: f2, individualId: lily, role: 'child', pedigree: 'birth' });
  await addFamilyMember({
    familyId: f2,
    individualId: petunia,
    role: 'child',
    pedigree: 'birth',
  });
  await addMarriage(f2);

  // F3: James + Lily → Harry
  const f3 = await createFamily({});
  await addFamilyMember({ familyId: f3, individualId: james, role: 'husband' });
  await addFamilyMember({ familyId: f3, individualId: lily, role: 'wife' });
  await addFamilyMember({ familyId: f3, individualId: harry, role: 'child', pedigree: 'birth' });
  await addMarriage(f3, 'ABT 1978', '1978', godricsHollow);

  // F4: Vernon + Petunia → Dudley
  const f4 = await createFamily({});
  await addFamilyMember({ familyId: f4, individualId: vernon, role: 'husband' });
  await addFamilyMember({ familyId: f4, individualId: petunia, role: 'wife' });
  await addFamilyMember({ familyId: f4, individualId: dudley, role: 'child', pedigree: 'birth' });
  await addMarriage(f4);

  // F5: Arthur + Molly → Bill, Charlie, Percy, Fred, George, Ron, Ginny
  const f5 = await createFamily({});
  await addFamilyMember({ familyId: f5, individualId: arthur, role: 'husband' });
  await addFamilyMember({ familyId: f5, individualId: molly, role: 'wife' });
  await addFamilyMember({ familyId: f5, individualId: bill, role: 'child', pedigree: 'birth' });
  await addFamilyMember({
    familyId: f5,
    individualId: charlie,
    role: 'child',
    pedigree: 'birth',
  });
  await addFamilyMember({ familyId: f5, individualId: percy, role: 'child', pedigree: 'birth' });
  await addFamilyMember({ familyId: f5, individualId: fred, role: 'child', pedigree: 'birth' });
  await addFamilyMember({ familyId: f5, individualId: george, role: 'child', pedigree: 'birth' });
  await addFamilyMember({ familyId: f5, individualId: ron, role: 'child', pedigree: 'birth' });
  await addFamilyMember({ familyId: f5, individualId: ginny, role: 'child', pedigree: 'birth' });
  await addMarriage(f5, 'ABT 1969', '1969', burrow);

  // F6: Harry + Ginny → James Sirius, Albus Severus, Lily Luna
  const f6 = await createFamily({});
  await addFamilyMember({ familyId: f6, individualId: harry, role: 'husband' });
  await addFamilyMember({ familyId: f6, individualId: ginny, role: 'wife' });
  await addFamilyMember({
    familyId: f6,
    individualId: jamesSirius,
    role: 'child',
    pedigree: 'birth',
  });
  await addFamilyMember({
    familyId: f6,
    individualId: albusSeverus,
    role: 'child',
    pedigree: 'birth',
  });
  await addFamilyMember({
    familyId: f6,
    individualId: lilyLuna,
    role: 'child',
    pedigree: 'birth',
  });
  await addMarriage(f6, 'ABT 2002', '2002');

  // F7: Bill + Fleur → Victoire, Dominique, Louis
  const f7 = await createFamily({});
  await addFamilyMember({ familyId: f7, individualId: bill, role: 'husband' });
  await addFamilyMember({ familyId: f7, individualId: fleur, role: 'wife' });
  await addFamilyMember({
    familyId: f7,
    individualId: victoire,
    role: 'child',
    pedigree: 'birth',
  });
  await addFamilyMember({
    familyId: f7,
    individualId: dominique,
    role: 'child',
    pedigree: 'birth',
  });
  await addFamilyMember({ familyId: f7, individualId: louis, role: 'child', pedigree: 'birth' });
  await addMarriage(f7, '1 AUG 1997', '1997-08-01');

  // F8: Percy + Audrey → Molly II, Lucy
  const f8 = await createFamily({});
  await addFamilyMember({ familyId: f8, individualId: percy, role: 'husband' });
  await addFamilyMember({ familyId: f8, individualId: audrey, role: 'wife' });
  await addFamilyMember({
    familyId: f8,
    individualId: mollyII,
    role: 'child',
    pedigree: 'birth',
  });
  await addFamilyMember({ familyId: f8, individualId: lucy, role: 'child', pedigree: 'birth' });
  await addMarriage(f8);

  // F9: George + Angelina → Fred II, Roxanne
  const f9 = await createFamily({});
  await addFamilyMember({ familyId: f9, individualId: george, role: 'husband' });
  await addFamilyMember({ familyId: f9, individualId: angelina, role: 'wife' });
  await addFamilyMember({ familyId: f9, individualId: fredII, role: 'child', pedigree: 'birth' });
  await addFamilyMember({
    familyId: f9,
    individualId: roxanne,
    role: 'child',
    pedigree: 'birth',
  });
  await addMarriage(f9);

  // F10: Ron + Hermione → Rose, Hugo
  const f10 = await createFamily({});
  await addFamilyMember({ familyId: f10, individualId: ron, role: 'husband' });
  await addFamilyMember({ familyId: f10, individualId: hermione, role: 'wife' });
  await addFamilyMember({ familyId: f10, individualId: rose, role: 'child', pedigree: 'birth' });
  await addFamilyMember({ familyId: f10, individualId: hugo, role: 'child', pedigree: 'birth' });
  await addMarriage(f10, 'ABT 2003', '2003');

  // =========================================================================
  // Update tree stats & close
  // =========================================================================

  await updateTreeStats(treeId, { individualCount: 35, familyCount: 10 });
  await closeTreeDb();

  // Mark as seeded
  await systemDb.execute(
    "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('demo_tree_seeded', 'true')",
    []
  );
}
