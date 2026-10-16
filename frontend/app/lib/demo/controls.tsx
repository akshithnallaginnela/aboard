import { useState, useSyncExternalStore } from "react";
import { Link, useNavigate, useRevalidator } from "react-router";
import { Button } from "~/components/ui/button";
import { errorMessage } from "../api";
import { sessionStore } from "../session";
import { DEMO_PASSWORD, type DemoPersona, type DemoRuntime, type DemoScenario } from "./index";
export function DemoControls({ runtime }: {
    runtime: DemoRuntime;
}) {
    useSyncExternalStore(runtime.controls.subscribe, runtime.controls.snapshot, () => 0);
    const { actor, scenario, latestLink } = runtime.controls.state;
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const [notice, setNotice] = useState("");
    function enter(persona: DemoPersona) {
        const member = runtime.controls.enter(persona);
        sessionStore.set(member);
        setNotice(`Entered ${member.displayName}'s synthetic demo.`);
        navigate(persona === "admin" ? "/admin/reports" : persona === "new" ? "/onboarding" : "/people");
        void revalidator.revalidate();
    }
    function reset() {
        runtime.controls.reset();
        sessionStore.set(null);
        setNotice("Synthetic data reset. Choose a persona to start again.");
        navigate("/login");
        void revalidator.revalidate();
    }
    function changeScenario(value: DemoScenario) {
        runtime.controls.setScenario(value);
        setNotice(value === "send_failure" ? "The next message will fail once. Use Retry to send it." : `Demo scenario: ${value}.`);
        void revalidator.revalidate();
    }
    function reply() {
        try {
            runtime.controls.incomingReply();
            setNotice("A synthetic reply was added to your first available conversation.");
            void revalidator.revalidate();
        }
        catch (error) {
            setNotice(errorMessage(error));
        }
    }
    return (<aside aria-label="Synthetic demo controls" className="border-b-2 border-accent bg-soft-context px-4 py-3 text-sm text-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-2">
        <p><strong>Synthetic demo.</strong> Fictional people, messages and reports. Nothing is sent, emailed or saved outside this tab. Reload resets everything; do not enter real personal data.</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => enter("member")}>Enter member demo</Button>
          <Button size="sm" variant="secondary" onClick={() => enter("helper")}>Helper persona</Button>
          <Button size="sm" variant="secondary" onClick={() => enter("new")}>New member</Button>
          <Button size="sm" variant="secondary" onClick={() => enter("admin")}>Moderator persona</Button>
          <Button size="sm" variant="secondary" onClick={reset}>Reset demo</Button>
          <label className="flex min-h-10 items-center gap-2" htmlFor="demo-scenario">
            Scenario
            <select id="demo-scenario" value={scenario} onChange={(event) => changeScenario(event.target.value as DemoScenario)} className="min-h-10 max-w-full rounded-input border border-control-border bg-surface px-2 text-ink">
              <option value="normal">Normal</option>
              <option value="empty">Empty discovery</option>
              <option value="unavailable">Service unavailable</option>
              <option value="send_failure">Next message fails</option>
            </select>
          </label>
          <Button size="sm" variant="secondary" disabled={!actor || scenario === "unavailable"} onClick={reply}>Simulate reply</Button>
          <Button size="sm" variant="secondary" disabled={!actor} onClick={() => {
            runtime.controls.expire();
            // Keep the UI snapshot until the loader detects expiry, as with a real server session.
            setNotice("Demo session expired. The next protected action requires login.");
            void revalidator.revalidate();
        }}>Expire session</Button>
        </div>
        <p className="break-words">Manual login: asha@example.test or admin@example.test · Password: {DEMO_PASSWORD}. Synthetic recovery links appear here after requesting one.</p>
        {latestLink ? <Link className="min-h-10 self-start font-semibold text-primary underline underline-offset-4" to={latestLink}>Open synthetic email link (no email sent)</Link> : null}
        {notice ? <p role="status">{notice}</p> : null}
      </div>
    </aside>);
}
