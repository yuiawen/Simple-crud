const express = require('express')
const logger = require('winston')
const Riak = require('no-riak')
const { cli } = require('winston')

const app = express()
const port = 5000

app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')


logger.info("Starting Client");
const client = new Riak.Client([
    'localhost:8098',
]);

app.get('/', async (req, res) => {
    let key = await client.listKeys({
        bucket: 'contact',
    })
    let contacts = []

    contacts = await Promise.all(key.map(async (key) => {
        let contact = await client.get({
            bucket: 'contact',
            key
        })
        return contact.content[0].value
    }))
    res.render('contact', {
        contacts
    })
})

app.get('/add', async (req, res) => {
    res.render('addContact')
})

app.post('/add', async (req, res) => {
    const nama = req.body.nama;
    const email = req.body.email;
    const telpon = req.body.telpon;

    const contact = {
        nama,
        email,
        telpon
    };

    await client.put({
        bucket: 'contact',
        key: telpon,
        content: {
            value: contact
        }
    });
    res.redirect('/');
});

app.get('/delete/:telpon', async (req, res) => {
    const telpon = req.params.telpon;
    await client.del({
        bucket: 'contact',
        key: telpon
    });

    setTimeout(() => {
        res.redirect('/');
    }, 3000);
});

app.get('/update/:telpon', async (req, res) => {
    const telpon = req.params.telpon;
    const contact = await client.get({
        bucket: 'contact',
        key: telpon
    });
    res.render('updateContact', { contact: contact.content[0].value });
});

app.post('/update/:telpon', async (req, res) => {
    const telpon = req.params.telpon;
    const nama = req.body.nama;
    const email = req.body.email;

    const contact = {
        nama,
        telpon,
        email
    };

    await client.put({
        bucket: 'contact',
        key: telpon,
        content: {
            value: contact
        }
    });
    res.redirect('/');
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`))