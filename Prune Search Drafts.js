(() => {
    let w = Workspace.create();
    w.tagFilter = 'search';

    let end = new QueryDate();
    end.field = 'modified';
    end.type = 'relative';
    end.days = -8;
    w.endDate = end;

    w.query('archive').forEach(d => {
        d.isTrashed = true;
        d.update();
    });
})();
