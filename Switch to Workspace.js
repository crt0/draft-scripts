(() => {
    let workspace_name = action.name.split(' ', 2)[0];
    let workspace = Workspace.find(workspace_name);
    if (!workspace) {
        context.fail("Can't find workspace " + workspace_name);
        return;
    }
    app.applyWorkspace(workspace);
})();
