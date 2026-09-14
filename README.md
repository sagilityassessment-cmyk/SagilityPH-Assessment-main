Upload contents to GitHub Pages and enable Pages.

## Firestore history permissions

The history uses anonymous Firebase Authentication. In the Firebase Console, open **Firestore Database > Rules**, replace the rules with the contents of [firestore.rules](firestore.rules), and click **Publish**. The Delete button removes selected records in Firestore so the change is shared across browsers.

## Sagi Notes

The [Sagi Notes](notes.html) page stores note titles and links in the `sagiNotes` Firestore collection. Publish the updated [firestore.rules](firestore.rules) file before using Notes so records can sync across devices.

## Typing Test results
The [Typing Test](typing-test/index.html) is available from the portal header. Candidates select their location and seat number at login. Completed tests and retakes save the location, seat number, name, timing, score, and accuracy in the shared `typingResults` Firestore collection. The portal displays the location and supports filtering by it. Publish [firestore.rules](firestore.rules) after deploying this feature so the results can be read and created by authenticated users.

## Location-specific testing rooms
Seat values and call queues are stored under a separate Realtime Database path for each selected location. Seat managers in the same location still sync across devices, while Iloilo City, Quezon City, Alabang, and Bohol remain isolated from one another. The display page listens only to its selected location.