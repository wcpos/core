import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';

export const Backdrop = styled.View`
	background-color: ${({ theme }) => theme.BACKDROP_COLOR};
	${{ ...StyleSheet.absoluteFillObject }}
	opacity: 0;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	z-index: ${({ theme }) => theme.BACKDROP_Z_INDEX};
`;