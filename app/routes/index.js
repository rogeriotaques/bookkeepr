/** Routes */

const { exec } = require('child_process');
const router = require('express').Router();

const renderApp = async (req, res, optionalData = {}) => {
  const now = new Date();
  const { path } = req;
  const { e = 0, m = null, search = '', id = null } = req.query;

  let { year = now.getFullYear(), month = now.getMonth() + 1} = req.query;

  const consumptionTax = await knex('config').where({ key: 'shouhizei'}).select('value').first().then((row) => +row.value).catch(() => 0);

  // Min and max year that can be selected
  const yearsRange = await knex('entries')
    .select([
      knex.raw("MIN(strftime('%Y', date)) AS minYear"),
      knex.raw("MAX(strftime('%Y', date)) AS maxYear")
    ])
    .then(rows => rows[0])
    .catch(() => ({minYear: year, maxYear: year}));

  if (!yearsRange.minYear) yearsRange.minYear = year;
  if (!yearsRange.maxYear) yearsRange.maxYear = year;

  // Last time an entry was added
  const lastUpdate = await knex('entries').max('date AS max_date').then(rows => rows[0].max_date);

  // All groups from settings
  const groups = await knex('groups').orderByRaw('name ASC').select(['id', 'code', 'name', 'operation']).catch(() => []);

  // All wallets from settings
  const wallets = await knex('wallets').orderByRaw('name ASC').select(['id', 'name']).catch(() => []);

  // All filters from settings
  const filters = await knex('filters').orderByRaw('title ASC').catch(() => []);

  // History of entries from a specific month
  const history = await knex('entries AS e')
    .join('groups AS g', 'g.code', '=', 'e.group')
    .join('wallets AS w', 'w.id', '=', 'e.wallet')
    .modify((builder) => {
      if (year && month) {
        builder.whereRaw("strftime('%Y-%m', e.date) = ?", `${year}-${`00${month}`.slice(-2)}`)
      }

      if (search) {
        builder.where((qb) => {
          qb
            .where('e.description', 'LIKE', `%${search}%`)
            .orWhere('e.amount', search)
            .orWhere('e.date', search)
            .orWhere('g.name', 'LIKE', `%${search}%`)
            .orWhere('w.name', 'LIKE', `%${search}%`)
            ;
        });
      }
    })
    .orderByRaw('e.date ASC')
    .select([
      'e.id',
      'e.date',
      'e.description',
      'e.amount',
      'e.group',
      'e.wallet',
      'g.operation',
      'g.name as group_name',
      'w.name as wallet_name',
      knex.raw("strftime('%d', e.date) as day")
    ])
    .catch(() => []);

  // Total entries from a specific year
  const report = await knex('entries AS e')
    .join('groups AS g', 'g.code', '=', 'e.group')
    .whereRaw("strftime('%Y', e.date) = ?", `${year}`)
    .orderByRaw('date ASC')
    .select([
      'e.date',
      'e.amount',
      'e.group',
      'g.name as group_name',
      'g.operation',
      knex.raw("strftime('%m', e.date) as month")
    ])
    .catch(() => []);

  const dataToAppend = { ...optionalData };

  const filtersReport = [];
  const reliabilityReportTable = [];
  const assetsReportTable = [];
  const balanceReportTable = [{
    groupCode: '-',
    groupName: 'Net worth',
    months: [0,0,0,0,0,0,0,0,0,0,0,0],
    subTotal: 0
  }];
  const taxesReportTable = [{
    groupCode: '-',
    groupName: 'Consumption (Shouhizei)',
    months: [0,0,0,0,0,0,0,0,0,0,0,0],
    subTotal: 0
  }];

  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  // Prepare reliability report
  groups.filter((g) => g.operation == 'outcome').forEach((g) => {
    reliabilityReportTable.push({
      groupCode: g.code,
      groupName: g.name,
      months: [0,0,0,0,0,0,0,0,0,0,0,0],
      subTotal: 0
    });
  });

  // Prepare assets report
  groups.filter((g) => g.operation == 'income').forEach((g) => {
    assetsReportTable.push({
      groupCode: g.code,
      groupName: g.name,
      months: [0,0,0,0,0,0,0,0,0,0,0,0],
      subTotal: 0
    });
  });

  // Calculate reliability report
  reliabilityReportTable.forEach((g, i) => {
    months.forEach((m) => {
      const monthlyAmount = report
        .filter((r) => r.month == m && r.operation == 'outcome' && r.group == g.groupCode)
        .reduce((a, r) => a + r.amount, 0);

      reliabilityReportTable[i].months[m - 1] = monthlyAmount;
    });

    reliabilityReportTable[i].subTotal = reliabilityReportTable[i].months.reduce((a, m) => a + m, 0);
  });

  // Calculate assets report
  assetsReportTable.forEach((g, i) => {
    months.forEach((m) => {
      const monthlyAmount = report
        .filter((r) => r.month == m && r.operation == 'income' && r.group == g.groupCode)
        .reduce((a, r) => a + r.amount, 0);

      assetsReportTable[i].months[m - 1] = monthlyAmount;
    });

    assetsReportTable[i].subTotal = assetsReportTable[i].months.reduce((a, m) => a + m, 0);
  });

  // Calculate tex report
  months.forEach((m) => {
    taxesReportTable[0].months[+m - 1] = assetsReportTable.reduce((a, g) => a + g.months[+m - 1], 0) * consumptionTax; // 10%
    taxesReportTable[0].subTotal = taxesReportTable[0].months.reduce((a, m) => a + m, 0);
  });

  // Calculate balance report
  months.forEach((m) => {
    balanceReportTable[0].months[+m - 1] = assetsReportTable.reduce((a, g) => a + g.months[+m - 1], 0) - reliabilityReportTable.reduce((a, g) => a + g.months[+m - 1], 0);
    balanceReportTable[0].subTotal = balanceReportTable[0].months.reduce((a, m) => a + m, 0);
  });

  // Prepare filters
  filters.forEach((f) => {
    const regExp = f.rule ? new RegExp(f.rule, 'i') : null;
    const iWallets = `${f.incomeWallets || ''}`.split(',').filter((w) => w !== '').map((w) => +w);
    const iGroups = `${f.incomeGroups || ''}`.split(',').filter((g) => g !== '').map((g) => +g);
    const oWallets = `${f.outcomeWallets || ''}`.split(',').filter((w) => w !== '').map((w) => +w);
    const oGroups = `${f.outcomeGroups || ''}`.split(',').filter((g) => g !== '').map((g) => +g);

    const outcome = history.filter((e) => {
      return e.operation == 'outcome'
        && (regExp ? regExp.test(e.description) : true)
        && (oWallets.length ? oWallets.includes(e.wallet) : true)
        && (oGroups.length ? oGroups.includes(e.group) : true);
    }).reduce((a, e) => a + e.amount, 0);

    const income = history.filter((e) => {
      return e.operation == 'income'
        && (regExp ? regExp.test(e.description) : true)
        && (iWallets.length ? iWallets.includes(e.wallet) : true)
        && (iGroups.length ? iGroups.includes(e.group) : true);
    }).reduce((a, e) => a + e.amount, 0);

    filtersReport.push({
      title: f.title,
      outcome,
      income
    });
  });

  if (!dataToAppend.data) {
    dataToAppend.data = {};
  }

  dataToAppend.data.groups = groups;

  dataToAppend.data.wallets = wallets;

  dataToAppend.data.history = history;

  dataToAppend.data.filters = filters;

  dataToAppend.data.report = {
    reliability: reliabilityReportTable,
    assets: assetsReportTable,
    balance: balanceReportTable,
    taxes: taxesReportTable
  };

  dataToAppend.data.historyFilters = filtersReport;

  dataToAppend.data.shouhizei = consumptionTax;

  return res.status(200).render('app', {
    url: path,
    error: e,
    message: m,
    lastUpdate,
    yearsRange,
    version: appVersion,
    appName: appName,
    pathToDb: pathToDb,
    year,
    month,
    search,
    id,
    ...dataToAppend
  });
};

// GETS

router.get('(/|/history|/settings|/report)', async (req, res) => {
  return await renderApp(req, res);
});

router.get('/wallets/delete/:id', async (req, res) => {
  const { id } = req.params;
  const wallet = await knex('wallets').where({id}).first().catch(() => null);

  if (!wallet) {
    res.redirect(`/settings?e=1&m=Wallet+not+found`);
  }

  try {
    await knex('wallets').where({ id }).del().catch(() => null);
  } catch (error) {
    return res.redirect('/settings?e=1&m=Error+when+deleting+the+wallet');
  }

  return res.redirect('/settings?e=0&m=Wallet+deleted');
});

router.get('/groups/delete/:id', async (req, res) => {
  const { id } = req.params;
  const wallet = await knex('groups').where({id}).first().catch(() => null);

  if (!wallet) {
    res.redirect(`/settings?e=1&m=Group+not+found`);
  }

  try {
    await knex('groups').where({ id }).del().catch(() => null);
  } catch (error) {
    return res.redirect('/settings?e=1&m=Error+when+deleting+the+group');
  }

  return res.redirect('/settings?e=0&m=Group+deleted');
});

router.get('/filters/delete/:id', async (req, res) => {
  const { id } = req.params;
  const filter = await knex('filters').where({id}).first().catch(() => null);

  if (!filter) {
    res.redirect(`/settings?e=1&m=Filter+not+found`);
  }

  try {
    await knex('filters').where({ id }).del().catch(() => null);
  } catch (error) {
    return res.redirect('/settings?e=1&m=Error+when+deleting+the+filter');
  }

  return res.redirect('/settings?e=0&m=Filter+deleted');
});

router.get('/history/delete/:id', async (req, res) => {
  const { id } = req.params;
  const { year = null, month = null, search = '' } = req.query;
  const entry = await knex('entries').where({ id }).first().catch(() => null);
  const params = `year=${year}&month=${month}&search=${encodeURIComponent(search)}`;

  if (!entry) {
    res.redirect(`/history?e=1&m=Entry+not+found&${params}`);
  }

  try {
    await knex('entries').where({ id }).del().catch(() => null);
  } catch (error) {
    return res.redirect(`/history?e=1&m=Error+when+deleting+the+entry&${params}`);
  }

  return res.redirect(`/history?e=0&m=Entry+deleted&${params}`);
});

router.get('/vacuum', async (req, res) => {
  try {
    await knex.raw('VACUUM');
    return res.redirect('/settings?e=0&m=Database+vacuumed');
  } catch (error) {
    return res.redirect('/settings?e=1&m=' + encodeURIComponent(error.message));
  }
});

router.get('/backup', (req, res) => {
  const backupFileName = `${appName}_${(new Date()).toLocaleDateString('ja-JP', { timezone: 'JST', year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '')}.db`;

  exec(`cp ${app.locals.pathToDb} ~/${backupFileName}`, (err, stdout, stderr) => {
    if (err || stderr) {
      return res.redirect('/settings?e=1&m=' + encodeURIComponent(err ? err.message : stderr));
    }

    return res.redirect(`/settings?e=0&m=Database+backed+up+to+~/${backupFileName}`);
  });
});

router.get('*', (req, res) => {
  res.status(302).redirect('/');
});

// POSTS

router.post('/add', async (req, res) => {
  let { amount, description, group, wallet, date } = req.body;

  amount = parseFloat(amount.replace(/[^0-9]/gi, ''));

  if (!amount || !description || !group || !wallet || !date) {
    return await renderApp(req, res, {
      error: 1,
      message: 'Missing required fields',
      data: req.body
    });
  }

  if (amount <= 0) {
    return await renderApp(req, res, {
      error: 1,
      message: 'Amount must be greater than 0',
      data: req.body
    });
  }

  try {
    await knex('entries').insert({ amount, description, group, wallet, date });
  } catch (error) {
    return res.redirect('/?e=1&m=Error+when+adding+the+entry');
  }

  return res.redirect('/?e=0&m=Entry+recorded');
});

router.post('/history', async (req, res) => {
  let { id, amount, description, group, wallet, date } = req.body;

  const { year = null, month = null, search = '' } = req.query;
  const params = `year=${year}&month=${month}&search=${encodeURIComponent(search)}`;
  const entry = await knex('entries').where({ id }).first().catch(() => null);

  if (!entry) {
    return res.redirect(`/history?e=1&m=Entry+not+found&${params}`);
  }

  // amount = parseFloat(amount.replace(/[^0-9]/gi, ''));

  if (!description || !group || !wallet) {
    return res.redirect(`/history?e=1&m=Missing+required+fields&${params}`);
  }

  try {
    await knex('entries').where({ id }).update({ description, group, wallet });
  } catch (error) {
    return res.redirect(`/history?e=1&m=Error+when+updating+the+entry&${params}`);
  }

  return res.redirect(`history?e=0&m=Entry+updated&${params}`);
});

router.post('/wallets', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.redirect('/settings?e=1&m=Wallet+name+is+required');
  }

  try {
    await knex('wallets').insert({ name });
  } catch (error) {
    return res.redirect('/settings?e=1&m=Error+when+adding+the+wallet');
  }

  return res.redirect('/settings?e=0&m=Wallet+added');
});

router.post('/groups', async (req, res) => {
  const { name, code = 0, operation = 'income' } = req.body;

  if (!name) {
    return res.redirect('/groups?e=1&m=Group+name+is+required');
  }

  try {
    await knex('groups').insert({ name, code, operation });
  } catch (error) {
    return res.redirect('/groups?e=1&m=Error+when+adding+the+group');
  }

  return res.redirect('/groups?e=0&m=Group+added');
});

router.post('/filters', async (req, res) => {
  const { title, rule = null, incomeGroups = null, incomeWallets = null, outcomeGroups = null, outcomeWallets = null } = req.body;

  if (!title) {
    return res.redirect('/settings?e=1&m=Filter+title+is+required');
  }

  try {
    await knex('filters').insert({ title, rule, incomeGroups, incomeWallets, outcomeGroups, outcomeWallets });
  } catch (error) {
    return res.redirect('/settings?e=1&m=Error+when+adding+the+filter');
  }

  return res.redirect('/settings?e=0&m=Filter+added');
});

router.post('/taxes', async (req, res) => {
  let { shouhizei = 0 } = req.body;

  shouhizei = parseFloat(shouhizei.replace(/[^0-9.]/gi, ''));

  if (shouhizei < 0) {
    return await renderApp(req, res, {
      error: 1,
      message: 'Tax must be 0 or greater',
      data: req.body
    });
  }

  try {
    const exists = await knex('config').where({ key: 'shouhizei' }).first().catch(() => null);

    if (!exists) {
      await knex('config').insert({ key: 'shouhizei', value: shouhizei });
    } else {
      await knex('config').where({ key: 'shouhizei' }).update({ value: shouhizei });
    }
  } catch (error) {
    return res.redirect('/settings?e=1&m=Error+when+updating+the+tax');
  }

  return res.redirect('/settings?e=0&m=Tax+updated');
});

module.exports = router;
