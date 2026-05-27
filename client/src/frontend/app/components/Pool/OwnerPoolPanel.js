import React, {useState, useMemo} from 'react';
import _ from 'lodash';
import {Button, Form, Icon, Message, Table} from 'semantic-ui-react';
import {getUserFromLocalStorage} from '../../actions/auth';
import {invitePoolParticipants} from '../../actions/pools';

function buildPoolJoinLink(poolMeta) {
    if (!poolMeta || typeof window === 'undefined') {
        return '';
    }
    const origin = window.location.origin;
    const pid = poolMeta.poolId || poolMeta.id;
    const code = poolMeta.code || '';
    if (pid) {
        return `${origin}/pools/${pid}?joinCode=${encodeURIComponent(code)}`;
    }
    return `${origin}/pools?joinCode=${encodeURIComponent(code)}`;
}

function buildJoinMessage(poolMeta) {
    if (!poolMeta) {
        return '';
    }
    const code = poolMeta.code || '';
    const link = buildPoolJoinLink(poolMeta);
    return `Join my pool "${poolMeta.name}" on Bet Pool. Code: ${code} ${link}`;
}

function whatsappShareUrl(text) {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

const OwnerPoolPanel = ({poolId, poolMeta, participates, onInvited}) => {
    const [inviteInput, setInviteInput] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);
    const [err, setErr] = useState(null);

    const user = getUserFromLocalStorage();
    const isOwner = poolMeta && user && _.toInteger(poolMeta.ownerId) === _.toInteger(user.userId);

    const rows = useMemo(() => {
        const list = Array.isArray(participates) ? participates : [];
        return _.orderBy(list, ['joined', 'username'], ['asc', 'asc']);
    }, [participates]);

    if (!isOwner) {
        return null;
    }

    const joinLink = buildPoolJoinLink(poolMeta);

    function parseInvitePayload(text) {
        const parts = _.split(text, /[\s,;]+/);
        const invitees = [];
        const inviteeEmails = [];
        _.forEach(parts, (p) => {
            const s = _.trim(p);
            if (!s) {
                return;
            }
            if (s.includes('@')) {
                inviteeEmails.push(s);
            } else if (/^\d+$/.test(s)) {
                invitees.push(_.parseInt(s, 10));
            }
        });
        return {invitees, inviteeEmails};
    }

    async function submitInvites() {
        setBusy(true);
        setErr(null);
        setMsg(null);
        try {
            const body = parseInvitePayload(inviteInput);
            if (_.isEmpty(body.invitees) && _.isEmpty(body.inviteeEmails)) {
                setErr('Enter user IDs or email addresses.');
                return;
            }
            const {data} = await invitePoolParticipants(poolId, body);
            const parts = [`Invited. Join link: ${data.joinLink || ''}`];
            if (_.size(data.emailInvites)) {
                parts.push(`${_.size(data.emailInvites)} email invite(s) created.`);
            }
            if (data.emailInvitesError) {
                parts.push(`Email invite storage: ${data.emailInvitesError} (run DB script sql/create_pool_invites_table.sql if needed).`);
            }
            setMsg(parts.join(' '));
            if (onInvited) {
                onInvited();
            }
            setInviteInput('');
        } catch (e) {
            setErr(_.get(e, 'response.data.error', e.message));
        } finally {
            setBusy(false);
        }
    }

    function copy(text) {
        if (!text || !navigator.clipboard) {
            return;
        }
        navigator.clipboard.writeText(text).then(() => setMsg('Copied to clipboard.'));
    }

    return (
        <div className="owner-pool-panel" style={{marginBottom: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px'}}>
            <h3>Pool owner</h3>
            {poolMeta && (
                <p>
                    <strong>Code:</strong> {poolMeta.code}{' '}
                    <Button size="mini" type="button" onClick={() => copy(poolMeta.code)}><Icon name="copy"/>Copy code</Button>
                    <Button size="mini" type="button" onClick={() => copy(joinLink)}><Icon name="link"/>Copy join link</Button>
                    <Button size="mini" as="a" href={whatsappShareUrl(buildJoinMessage(poolMeta))} target="_blank" rel="noopener noreferrer">
                        Share on WhatsApp
                    </Button>
                </p>
            )}
            {err && <Message negative content={err}/>}
            {msg && <Message info content={msg}/>}
            <Form onSubmit={(e) => { e.preventDefault(); submitInvites(); }}>
                <Form.Field>
                    <label>Invite by user ID or email (space or comma separated)</label>
                    <textarea
                        rows={2}
                        value={inviteInput}
                        onChange={(e) => setInviteInput(e.target.value)}
                        placeholder="e.g. 12 34 or friend@email.com"
                    />
                </Form.Field>
                <Button primary type="submit" loading={busy} disabled={busy}>Send invites</Button>
            </Form>
            <h4 style={{marginTop: '20px'}}>Participants</h4>
            <Table compact celled size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>User</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {rows.map((row) => (
                        <Table.Row key={row.userId}>
                            <Table.Cell>{row.username || row.userId}</Table.Cell>
                            <Table.Cell>{row.joined ? 'Joined' : 'Invited'}</Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </div>
    );
};

export default OwnerPoolPanel;
