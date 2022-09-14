// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Coin } from '@mysten/sui.js';
import cl from 'classnames';
import { memo, useMemo } from 'react';
import { useIntl } from 'react-intl';

import st from './CoinBalance.module.scss';

export type CoinBalanceProps = {
    className?: string;
    balance: bigint;
    coinTypeArg: string;
    mode?: 'neutral' | 'positive' | 'negative';
    diffSymbol?: boolean;
    title?: string;
};

function CoinBalance({
    balance,
    coinTypeArg,
    className,
    mode = 'neutral',
    diffSymbol = false,
    title,
}: CoinBalanceProps) {
    const intl = useIntl();
    const { value, formatOptions, symbol } = useMemo(
        () => Coin.getFormatData(balance, coinTypeArg, 'accurate'),
        [balance, coinTypeArg]
    );
    return (
        <div className={cl(className, st.container, st[mode])} title={title}>
            <span>{intl.formatNumber(value, formatOptions)}</span>
            <span className={cl(st.symbol, { [st.diffSymbol]: diffSymbol })}>
                {symbol}
            </span>
        </div>
    );
}

export default memo(CoinBalance);
