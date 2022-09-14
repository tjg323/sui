// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Coin } from '@mysten/sui.js';
import cl from 'classnames';
import { memo, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Icon, { SuiIcons } from '_components/icon';
import { formatDate } from '_helpers';
import { useMiddleEllipsis } from '_hooks';
import { GAS_TYPE_ARG } from '_redux/slices/sui-objects/Coin';

import type { TxResultState } from '_redux/slices/txresults';

import st from './TransactionsCard.module.scss';

const TRUNCATE_MAX_LENGTH = 8;
const TRUNCATE_PREFIX_LENGTH = 4;

function TransactionCard({ txn }: { txn: TxResultState }) {
    const toAddrStr = useMiddleEllipsis(
        txn.to || '',
        TRUNCATE_MAX_LENGTH,
        TRUNCATE_PREFIX_LENGTH
    );
    const fromAddrStr = useMiddleEllipsis(
        txn.from || '',
        TRUNCATE_MAX_LENGTH,
        TRUNCATE_PREFIX_LENGTH
    );

    const intl = useIntl();

    const transferStatus = txn.status === 'success' ? 'Checkmark' : 'Close';

    //TODO update the logic to account for other transfer type
    const TxIcon = txn.isSender ? SuiIcons.ArrowLeft : SuiIcons.Buy;
    const iconClassName = txn.isSender
        ? cl(st.arrowActionIcon, st.angledArrow)
        : cl(st.arrowActionIcon, st.buyIcon);

    const date = txn?.timestampMs
        ? formatDate(txn.timestampMs, [
              'weekday',
              'month',
              'day',
              // 'hour',
              // 'minute',
          ])
        : false;
    const txAmount = txn.amount;
    // XXX: supports only SUI - it seems we always assume the type of the amount of a tx is SUI
    const txAmountFormatData = useMemo(
        () =>
            txAmount
                ? Coin.getFormatData(BigInt(txAmount), GAS_TYPE_ARG, 'loose')
                : null,
        [txAmount]
    );

    return (
        <Link
            to={`/receipt?${new URLSearchParams({
                txdigest: txn.txId,
            }).toString()}`}
            className={st.txCard}
        >
            <div className={st.card} key={txn.txId}>
                <div className={st.cardIcon}>
                    <Icon icon={TxIcon} className={iconClassName} />
                </div>
                <div className={st.cardContent}>
                    <div className={st.txResult}>
                        <div className={cl(st.txTypeName, st.kind)}>
                            {txn.kind}
                        </div>
                        {date && <div className={st.txTypeDate}>{date}</div>}
                    </div>
                    <div className={st.txResult}>
                        <div className={st.txTypeName}>
                            {txn.kind !== 'Call' && txn.isSender
                                ? 'To'
                                : 'From'}
                        </div>
                        <div className={cl(st.txValue, st.txAddress)}>
                            {txn.kind !== 'Call' && txn.isSender
                                ? toAddrStr
                                : fromAddrStr}
                            <span
                                className={cl(
                                    st[txn.status.toLowerCase()],
                                    st.txstatus
                                )}
                            >
                                <Icon icon={SuiIcons[transferStatus]} />
                            </span>
                        </div>
                    </div>
                </div>
                <div className={st.txTransferred}>
                    {txAmountFormatData && (
                        <>
                            <div className={st.txAmount}>
                                {intl.formatNumber(
                                    txAmountFormatData.value,
                                    txAmountFormatData.formatOptions
                                )}{' '}
                                {txAmountFormatData.symbol}
                            </div>
                            <div className={st.txFiatValue}></div>
                        </>
                    )}
                    {txn.url && (
                        <div className={st.txImage}>
                            <img
                                src={txn.url.replace(
                                    /^ipfs:\/\//,
                                    'https://ipfs.io/ipfs/'
                                )}
                                alt="NFT"
                            />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default memo(TransactionCard);
