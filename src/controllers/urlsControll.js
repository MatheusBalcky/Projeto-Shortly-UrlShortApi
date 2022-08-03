import { clientPg } from "../db/postgres.js";
import { nanoid } from 'nanoid';

export async function urlShortenControll (req, res){
    const shortUrl = nanoid();
    const { userEmail } = res.locals.verifyTokenResult;
    const { url } = req.body;

    try {

        const { rows: userId } = await clientPg.query(`SELECT id FROM users WHERE email = $1`, [userEmail]);
        
        await clientPg.query(`
        INSERT INTO "shortenUrls" (url, "fromUserId", "shortUrl")
        VALUES ($1, $2, $3)`,
        [url, userId[0].id, shortUrl]);

        res.status(201).send( {shortUrl: shortUrl} );

    } catch (error) {

        console.log(error);
        res.sendStatus(500);

    }
}

export async function getUrlById (req, res){
    const id = parseInt(req.params.id);
    if(isNaN(id)){
        return res.sendStatus(422);
    }

    try {
        const { rows: findUrlById } = await clientPg.query(`
        SELECT id, url, "shortUrl" FROM "shortenUrls"
        WHERE id = $1`, [id]);
        
        if(findUrlById.length < 1){
            res.sendStatus(404);
        }

        res.status(200).send(findUrlById[0]);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}