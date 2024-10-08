import type { ActorSubclass, Identity } from '@dfinity/agent';
import { get, writable } from 'svelte/store';
import type { _SERVICE } from '../../../declarations/contract/contract.did';
import { canisterId } from '../../../declarations/contract';
import type { _SERVICE as _ICRC1_SERVICE } from '../../../declarations/icrc1_ledger_canister/icrc1_ledger_canister.did';
import { connect } from './canisters';
import { Principal } from '@dfinity/principal';

export const wallet = createWallet();
export let stateWallet: MaybeWallet = $state({
	connected: false,
	actor: undefined,
	tokenActor: undefined,
	identity: undefined
});

export interface Wallet {
	connected: true;
	actor: ActorSubclass<_SERVICE>;
	tokenActor: ActorSubclass<_ICRC1_SERVICE>;
	identity: Identity;
}

export interface MaybeWallet {
	connected: boolean;
	actor: ActorSubclass<_SERVICE> | undefined;
	tokenActor: ActorSubclass<_ICRC1_SERVICE> | undefined;
	identity: Identity | undefined;
}

function createWallet() {
	const { subscribe, set, update } = writable<{ connected: false } | Wallet>({
		connected: false
	});

	return {
		subscribe,
		connect: async () => {
			const { actor, tokenActor, identity } = await connect();
			console.log(identity.getPrincipal().toText());
			const wallet = { connected: true, actor, tokenActor, identity };
			set(wallet);
			stateWallet.connected = true;
			stateWallet.actor = actor;
			stateWallet.tokenActor = tokenActor;
			stateWallet.identity = identity;

			const balance = await tokenActor.icrc1_balance_of({
				owner: identity.getPrincipal(),
				subaccount: []
			});

			console.log('Current balance:', balance);
		},
		getTransferFee: async () => {
			const current = get(wallet);
			if (!current.connected) await wallet.connect();
			if (!current.connected) throw new Error('Not connected');

			const fee = await current.tokenActor.icrc1_fee();
			return fee;
		},
		approve: async (amount: bigint) => {
			const current = get(wallet);
			if (!current.connected) await wallet.connect();
			if (!current.connected) throw new Error('Not connected');

			const spender = Principal.fromText(canisterId);
			const fee = await current.tokenActor.icrc1_fee();

			const approveResult = await current.tokenActor.icrc2_approve({
				fee: [],
				from_subaccount: [],
				memo: [],
				created_at_time: [],
				amount: amount + fee,
				expected_allowance: [],
				expires_at: [],
				spender: { owner: spender, subaccount: [] }
			});
		},
		balance: async () => {
			const current = get(wallet);
			if (!current.connected) await wallet.connect();
			if (!current.connected) throw new Error('Not connected');

			const balance = await current.tokenActor.icrc1_balance_of({
				owner: current.identity.getPrincipal(),
				subaccount: []
			});

			return balance;
		}
	};
}
