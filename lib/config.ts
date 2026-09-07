// Lieu et horaire du dîner, communiqués aux inscrits via l'email « le lieu se
// dévoile » (route /api/admin/send-lieu).
//
// Le lieu exact est dévoilé au dernier moment et peut changer d'un dîner à
// l'autre : renseigne-le au moment de l'envoi, soit en passant `lieu` / `horaire`
// dans la requête, soit en mettant à jour ces constantes puis en redéployant.
export const LIEU = "À communiquer"
export const HORAIRE = "19h"
