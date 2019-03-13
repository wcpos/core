import React, { Component } from 'react';
import {
	Text,
	ListView,
	FlatList,
	TextInput,
	View,
	TouchableOpacity,
	Keyboard,
	ViewPagerAndroidOnPageScrollEventData,
} from 'react-native';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

const defaultItemValue = {
	name: '',
	id: 0,
};

interface Props {
	itemsContainerStyle?: {};
	items?: any;
	defaultIndex?: number;
	onTextChange: (text?: string) => void;
	name?: string;
	textInputStyle?: {};
	placeholderTextColor?: string;
	placeholder?: string;
	underlineColorAndroid?: string;
	containerStyle?: {};
	listType?: any;
	itemTextStyle?: {};
	resetValue?: any;
	itemStyle?: {};
	onItemSelect: (item: any) => void;
}

interface State {
	item: any;
	listItems: any;
	focus: boolean;
}

export default class SearchableDropDown extends Component<Props, State> {
	public input?: any = null;
	constructor(props: Props) {
		super(props);
		this.state = {
			item: {},
			listItems: [],
			focus: false,
		};
	}

	renderList = () => {
		if (this.state.focus) {
			return (
				<ListView
					style={{ ...this.props.itemsContainerStyle }}
					keyboardShouldPersistTaps="always"
					dataSource={ds.cloneWithRows(this.state.listItems)}
					renderRow={this.renderItems}
				/>
			);
		}
	};

	renderFlatList = () => {
		if (this.state.focus) {
			return (
				<FlatList
					style={{ ...this.props.itemsContainerStyle }}
					keyboardShouldPersistTaps="always"
					data={this.state.listItems}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({ item }) => this.renderItems(item)}
				/>
			);
		}
	};

	componentDidMount = () => {
		const listItems = this.props.items;
		const defaultIndex = this.props.defaultIndex;

		if (defaultIndex && listItems.length > defaultIndex) {
			this.setState({
				listItems,
				item: listItems[defaultIndex],
			});
		} else {
			this.setState({ listItems });
		}
	};

	searchedItems = (searchedText: string) => {
		var ac = this.props.items.filter(function(item: any) {
			return item.name.toLowerCase().indexOf(searchedText.toLowerCase()) > -1;
		});
		let item = {
			id: -1,
			name: searchedText,
		};
		this.setState({ listItems: ac, item: item });
		const onTextChange = this.props.onTextChange;

		if (onTextChange && typeof onTextChange === 'function') {
			setTimeout(() => {
				onTextChange(searchedText);
			}, 0);
		}
	};

	renderItems = (item: any) => {
		return (
			<TouchableOpacity
				style={{ ...this.props.itemStyle }}
				onPress={() => {
					this.setState({ item: item, focus: false });
					Keyboard.dismiss();
					setTimeout(() => {
						this.props.onItemSelect(item);

						if (this.props.resetValue) {
							this.setState({ focus: true, item: defaultItemValue });
							this.input.focus();
						}
					}, 0);
				}}
			>
				<Text style={{ ...this.props.itemTextStyle }}>{item.name}</Text>
			</TouchableOpacity>
		);
	};

	renderListType = () => {
		return this.props.listType === 'ListView' ? this.renderList() : this.renderFlatList();
	};

	render = () => {
		return (
			<View
				//keyboardShouldPersist="always"
				style={{ ...this.props.containerStyle }}
			>
				<TextInput
					ref={e => (this.input = e)}
					underlineColorAndroid={this.props.underlineColorAndroid}
					onFocus={() => {
						this.setState({
							focus: true,
							item: defaultItemValue,
							listItems: this.props.items,
						});
					}}
					onChangeText={text => {
						this.searchedItems(text);
					}}
					value={this.state.item.name}
					style={{ ...this.props.textInputStyle }}
					placeholderTextColor={this.props.placeholderTextColor}
					placeholder={this.props.placeholder}
				/>
				{this.renderListType()}
			</View>
		);
	};
}
