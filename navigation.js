// Browser history also powers Android's system Back gesture in the installed app.
window.AppNavigation = (() => {
  let restoring = false;
  let pendingPush = false;
  let depth = 0;
  let modal = null;
  const snapshot = () => ({ moveStrong: true, depth, route, selectedWeek, selectedDay,
    selectedSession, health: HealthUI.navigationState(), modal });
  function record() {
    if (restoring) return;
    if (pendingPush) { depth++; history.pushState(snapshot(), ''); }
    else history.replaceState(snapshot(), '');
    pendingPush = false;
  }
  function restore(saved) {
    if (!saved?.moveStrong) return;
    const sameScreen = saved.route === route && saved.selectedWeek === selectedWeek &&
      saved.selectedDay === selectedDay && saved.selectedSession === selectedSession &&
      JSON.stringify(saved.health) === JSON.stringify(HealthUI.navigationState());
    restoring = true;
    depth = saved.depth;
    modal = saved.modal;
    route = saved.route;
    selectedWeek = saved.selectedWeek;
    selectedDay = saved.selectedDay;
    selectedSession = saved.selectedSession;
    HealthUI.restoreNavigation(saved.health);
    document.getElementById('exerciseOverlay').classList.add('hidden');
    document.getElementById('timerOverlay').classList.add('hidden');
    document.body.classList.remove('modal-open');
    clearInterval(timerId);
    if (!sameScreen) render();
    if (modal?.kind === 'guide') openExerciseGuide(modal.data);
    if (modal?.kind === 'timer') openTimer(modal.data);
    restoring = false;
  }
  addEventListener('popstate', event => restore(event.state));
  if (history.state?.moveStrong) restore(history.state);
  else record();
  return {
    record,
    begin(next) { pendingPush = next !== route || JSON.stringify(history.state?.health) !== JSON.stringify(HealthUI.navigationState()); },
    back() { if (depth > 0) history.back(); else routeTo('home'); },
    openModal(kind, data) {
      if (restoring || modal?.kind === kind) return;
      modal = { kind, data }; pendingPush = true; record();
    },
    closeModal(kind) {
      if (restoring || modal?.kind !== kind) return false;
      history.back(); return true;
    }
  };
})();
