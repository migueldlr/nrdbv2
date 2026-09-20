// oxlint-disable typescript/no-explicit-any
import * as ohm from 'ohm-js';

export const queryGrammar = ohm.grammar(String.raw`
Query {
  exp
    = spaces addExp spaces

  addExp
    = spaces priExp space+ conjunctionWord space+ addExp spaces -- and_or
    | spaces priExp space+ addExp spaces -- and_default
    | spaces priExp spaces -- default

  priExp
    = "(" exp ")" ~(conjunctionSymbol)  -- paren_exp
    | "!" priExp   -- negate_not
    | "-" priExp   -- negate_minus
    | condition

  condition
  	= operand operator value -- operator
    | value -- default

  operator
  	= "<=" -- le
    | ">=" -- ge
    | ":" -- is
    | "!" -- not
    | "<" -- lt
    | ">" -- gt

  operand
  	= operandLiteral

  value
  	= valueExp

  valueExp
  	= valueExp conjunctionSymbol valueLiteral -- and_or
    | valueLiteral

  valueLiteral
    = "(" spaces parenTerm spaces ")" -- paren
    | stringLiteral
    | regularExpressionLiteral
    | nonSpacedLiteral

  parenTerm
    = value spaces conjunctionSymbol spaces value -- and_or
    | value

  conjunctionWord
  	= "and" -- and
    | "or" -- or

  conjunctionSymbol
  	= "&" -- and
    | "|" -- or

  stringLiteral
  	= "\"" ~("\"") doubleStringCharacter* "\""
    | "'" ~("'") singleStringCharacter* "'"
  doubleStringCharacter
  	= ~("\"") literal -- nonEscaped
	  | "\\" escapeSequence -- escaped
  singleStringCharacter
  	= ~("'") literal -- nonEscaped
	  | "\\" escapeSequence -- escaped
  escapeSequence
  	= characterEscapeSequence
  characterEscapeSequence
  	= escapeCharacter
    | nonEscapeCharacter
  escapeCharacter
  	= "'" | "\"" | "\\"
  nonEscapeCharacter
  	= ~(escapeCharacter) literal
  operandLiteral
  	= (letter | "_")+
  nonSpacedLiteral
  	= (letter | digit | "_" | "!" | "-")+
  literal
  	= any

  regularExpressionLiteral
  	= "/" regularExpressionBody "/"
  regularExpressionBody
  	= regularExpressionFirstChar regularExpressionChar*
  regularExpressionFirstChar
  	= ~("*" | "\\" | "/" | "[") literal
    | regularExpressionBackslashSequence
    | regularExpressionClass
  regularExpressionChar
  	= ~("\\" | "/" | "[") literal
    | regularExpressionBackslashSequence
    | regularExpressionClass
  regularExpressionBackslashSequence
  	= "\\" literal
  regularExpressionClass
    = "[" regularExpressionClassChar* "]"
  regularExpressionClassChar
  	= ~("]" | "\\") literal
	  | regularExpressionBackslashSequence
}
`);

export interface FieldData {
	type: 'array' | 'boolean' | 'date' | 'format' | 'integer' | 'string';
	sql: string;
	keywords: string[];
}

export interface FullFieldData {
	type: 'array' | 'boolean' | 'date' | 'format' | 'integer' | 'string';
	sql: { c?: string; p?: string };
	keywords: string[];
}

export const fullFields: FullFieldData[] = [
	{
		type: 'array',
		sql: { c: 'unified_cards.card_cycle_ids' },
		keywords: ['card_cycle', 'c']
	},
	{
		type: 'array',
		sql: { c: 'unified_cards.card_pool_ids', p: 'unified_printings.card_pool_ids' },
		keywords: ['card_pool', 'z']
	},
	{
		type: 'array',
		sql: { c: 'unified_cards.card_set_ids' },
		keywords: ['card_set', 'e']
	},
	{
		type: 'array',
		sql: {
			c: 'unified_cards.lower_card_subtype_names',
			p: 'unified_printings.lower_card_subtype_names'
		},
		keywords: ['card_subtype', 's']
	},
	{
		type: 'array',
		sql: { c: 'unified_cards.card_subtype_ids', p: 'unified_printings.card_subtype_ids' },
		keywords: ['card_subtype_id']
	},
	{
		type: 'array',
		sql: { c: 'unified_cards.restrictions_points', p: 'unified_printings.restrictions_points' },
		keywords: ['eternal_points']
	},
	{
		type: 'array',
		sql: { c: 'unified_cards.format_ids', p: 'unified_printings.format_ids' },
		keywords: ['format_id']
	},
	{
		type: 'array',
		sql: {
			c: 'unified_cards.restrictions_global_penalty',
			p: 'unified_printings.restrictions_global_penalty'
		},
		keywords: ['has_global_penalty']
	},
	{
		type: 'array',
		sql: { p: 'unified_printings.illustrator_ids' },
		keywords: ['illustrator_id']
	},
	{
		type: 'array',
		sql: { c: 'unified_cards.restrictions_banned', p: 'unified_printings.restrictions_banned' },
		keywords: ['is_banned']
	},
	{
		type: 'array',
		sql: {
			c: 'unified_cards.restrictions_restricted',
			p: 'unified_printings.restrictions_restricted'
		},
		keywords: ['is_restricted']
	},
	{
		type: 'array',
		sql: { c: 'unified_cards.printing_ids' },
		keywords: ['printing_id']
	},
	{
		type: 'array',
		sql: {
			c: 'unified_cards.printings_released_by',
			p: 'unified_printings.printings_released_by'
		},
		keywords: ['printings_released_by']
	},
	{
		type: 'array',
		sql: { c: 'unified_cards.restriction_ids', p: 'unified_printings.restriction_ids' },
		keywords: ['restriction_id', 'b']
	},
	{
		type: 'array',
		sql: { c: 'unified_cards.snapshot_ids', p: 'unified_printings.snapshot_ids' },
		keywords: ['snapshot']
	},
	{
		type: 'array',
		sql: {
			c: 'unified_cards.restrictions_universal_faction_cost',
			p: 'unified_printings.restrictions_universal_faction_cost'
		},
		keywords: ['universal_faction_cost']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.additional_cost', p: 'unified_printings.additional_cost' },
		keywords: ['additional_cost']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.advanceable', p: 'unified_printings.advanceable' },
		keywords: ['advanceable']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.charge', p: 'unified_printings.charge' },
		keywords: ['charge']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.gains_subroutines', p: 'unified_printings.gains_subroutines' },
		keywords: ['gains_subroutines']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.gains_click', p: 'unified_printings.gains_click' },
		keywords: ['gains_click']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.has_paid_ability', p: 'unified_printings.has_paid_ability' },
		keywords: ['has_paid_ability']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.in_restriction', p: 'unified_printings.in_restriction' },
		keywords: ['in_restriction']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.install_effect', p: 'unified_printings.install_effect' },
		keywords: ['install_effect']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.interrupt', p: 'unified_printings.interrupt' },
		keywords: ['interrupt']
	},
	{
		type: 'boolean',
		sql: { p: 'unified_printings.is_latest_printing' },
		keywords: ['is_latest_printing']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.is_unique', p: 'unified_printings.is_unique' },
		keywords: ['is_unique', 'u']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.mark', p: 'unified_printings.mark' },
		keywords: ['mark']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.on_encounter_effect', p: 'unified_printings.on_encounter_effect' },
		keywords: ['on_encounter_effect']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.performs_trace', p: 'unified_printings.performs_trace' },
		keywords: ['performs_trace']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.rez_effect', p: 'unified_printings.rez_effect' },
		keywords: ['rez_effect']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.sabotage', p: 'unified_printings.sabotage' },
		keywords: ['sabotage']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.score_effect', p: 'unified_printings.score_effect' },
		keywords: ['score_effect']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.steal_effect', p: 'unified_printings.steal_effect' },
		keywords: ['steal_effect']
	},
	{
		type: 'boolean',
		sql: { c: 'unified_cards.trash_ability', p: 'unified_printings.trash_ability' },
		keywords: ['trash_ability']
	},
	{
		type: 'date',
		sql: { c: 'unified_cards.date_release', p: 'unified_printings.date_release' },
		keywords: ['release_date', 'date_release', 'r']
	},
	{
		type: 'format',
		sql: { c: 'unified_cards.ignored_placeholder', p: 'unified_printings.ignored_placeholder' },
		keywords: ['format']
	},
	{
		type: 'integer',
		sql: {
			c: 'unified_cards.advancement_requirement',
			p: 'unified_printings.advancement_requirement'
		},
		keywords: ['advancement_cost', 'g']
	},
	{
		type: 'integer',
		sql: { c: 'unified_cards.agenda_points', p: 'unified_printings.agenda_points' },
		keywords: ['agenda_points', 'v']
	},
	{
		type: 'integer',
		sql: { c: 'unified_cards.base_link', p: 'unified_printings.base_link' },
		keywords: ['base_link', 'l']
	},
	{
		type: 'integer',
		sql: { c: 'unified_cards.cost', p: 'unified_printings.cost' },
		keywords: ['cost', 'o']
	},
	{
		type: 'integer',
		sql: { c: 'unified_cards.influence_cost', p: 'unified_printings.influence_cost' },
		keywords: ['influence_cost', 'n']
	},
	{
		type: 'integer',
		sql: { c: 'unified_cards.link_provided', p: 'unified_printings.link_provided' },
		keywords: ['link_provided']
	},
	{
		type: 'integer',
		sql: { c: 'unified_cards.memory_cost', p: 'unified_printings.memory_cost' },
		keywords: ['memory_usage', 'm']
	},
	{
		type: 'integer',
		sql: { c: 'unified_cards.mu_provided', p: 'unified_printings.mu_provided' },
		keywords: ['mu_provided']
	},
	{
		type: 'integer',
		sql: {
			c: 'unified_cards.num_printed_subroutines',
			p: 'unified_printings.num_printed_subroutines'
		},
		keywords: ['num_printed_subroutines']
	},
	{
		type: 'integer',
		sql: { c: 'unified_cards.minimum_deck_size', p: 'unified_printings.minimum_deck_size' },
		keywords: ['minimum_deck_size', 'min_deck_size']
	},
	{
		type: 'integer',
		sql: { c: 'unified_cards.num_printings', p: 'unified_printings.num_printings' },
		keywords: ['num_printings']
	},
	{
		type: 'integer',
		sql: { p: 'unified_printings.position' },
		keywords: ['position']
	},
	{
		type: 'integer',
		sql: { p: 'unified_printings.quantity' },
		keywords: ['quantity', 'y']
	},
	{
		type: 'integer',
		sql: {
			c: 'unified_cards.recurring_credits_provided',
			p: 'unified_printings.recurring_credits_provided'
		},
		keywords: ['recurring_credits_provided']
	},
	{
		type: 'integer',
		sql: { c: 'unified_cards.strength', p: 'unified_printings.strength' },
		keywords: ['strength', 'p']
	},
	{
		type: 'integer',
		sql: { c: 'unified_cards.trash_cost', p: 'unified_printings.trash_cost' },
		keywords: ['trash_cost', 'h']
	},
	{
		type: 'string',
		sql: { c: 'unified_cards.attribution', p: 'unified_printings.attribution' },
		keywords: ['attribution']
	},
	{
		type: 'string',
		sql: { p: 'unified_printings.card_cycle_id' },
		keywords: ['card_cycle', 'c']
	},
	{
		type: 'string',
		sql: { p: 'unified_printings.card_id' },
		keywords: ['card_id']
	},
	{
		type: 'string',
		sql: { p: 'unified_printings.card_set_id' },
		keywords: ['card_set', 'e']
	},
	{
		type: 'string',
		sql: { c: 'unified_cards.card_type_id', p: 'unified_printings.card_type_id' },
		keywords: ['card_type', 't']
	},
	{
		type: 'string',
		sql: { c: 'unified_cards.designed_by', p: 'unified_printings.designed_by' },
		keywords: ['designed_by']
	},
	{
		type: 'string',
		sql: { p: 'unified_printings.display_illustrators' },
		keywords: ['illustrator', 'i']
	},
	{
		type: 'string',
		sql: { c: 'unified_cards.faction_id', p: 'unified_printings.faction_id' },
		keywords: ['faction', 'f']
	},
	{
		type: 'string',
		sql: { p: 'unified_printings.flavor' },
		keywords: ['flavor', 'flavour', 'a']
	},
	{
		type: 'string',
		sql: { p: 'unified_printings.released_by' },
		keywords: ['released_by']
	},
	{
		type: 'string',
		sql: { c: 'unified_cards.side_id', p: 'unified_printings.side_id' },
		keywords: ['side', 'd']
	},
	{
		type: 'string',
		sql: { c: 'unified_cards.stripped_text', p: 'unified_printings.stripped_text' },
		keywords: ['stripped_text', 'x', 'text']
	},
	{
		type: 'string',
		sql: { c: 'unified_cards.stripped_title', p: 'unified_printings.stripped_title' },
		keywords: ['stripped_title', 'title', '_']
	},
	{
		type: 'string',
		sql: { c: 'unified_cards.id', p: 'unified_printings.id' },
		keywords: ['id']
	}
];

export const OPERATORS = {
	array: {
		':': '',
		'!': 'NOT'
	},
	boolean: {
		':': '=',
		'!': '!='
	},
	date: {
		':': '=',
		'!': '!=',
		'<': '<',
		'<=': '<=',
		'>': '>',
		'>=': '>='
	},
	format: {
		':': 'FORMAT'
	},
	integer: {
		':': '=',
		'!': '!=',
		'<': '<',
		'<=': '<=',
		'>': '>',
		'>=': '>='
	},
	string: {
		':': 'LIKE',
		'!': 'NOT LIKE'
	},
	regex: {
		':': 'REGEXP',
		'!': 'NOT REGEXP'
	}
} as const;

export const semantics = queryGrammar.createSemantics();

semantics.addOperation('eval', {
	// oxlint-disable-next-line no-unused-vars
	exp(spaces1, addExp, spaces2) {
		return addExp.eval();
	},
	// oxlint-disable-next-line no-unused-vars
	addExp_and_or(spaces1, priExp, spacePlus1, conjunctionWord, spacePlus2, addExp, spaces2) {
		return {
			type: 'conjunction',
			op: conjunctionWord.sourceString.trim().toLowerCase(),
			left: priExp.eval(),
			right: addExp.eval()
		};
	},
	// oxlint-disable-next-line no-unused-vars
	addExp_and_default(spaces1, priExp, spacePlus1, addExp, spaces2) {
		return {
			type: 'conjunction',
			op: 'and',
			left: priExp.eval(),
			right: addExp.eval()
		};
	},
	// oxlint-disable-next-line no-unused-vars
	addExp_default(spaces1, priExp, spaces2) {
		return priExp.eval();
	},
	// oxlint-disable-next-line no-unused-vars
	priExp_paren_exp(openParen, exp, closeParen) {
		return {
			type: 'bracketed',
			child: exp.eval()
		};
	},
	priExp_negate_not(negSign, priExp) {
		return {
			type: 'negate',
			child: priExp.eval()
		};
	},
	priExp_negate_minus(negSign, priExp) {
		return {
			type: 'negate',
			child: priExp.eval()
		};
	},
	condition_operator(operand, operator, value) {
		return {
			type: 'pair',
			keyword: operand.sourceString,
			operator: operator.sourceString,
			values: value.eval()
		};
	},
	condition_default(value) {
		return {
			type: 'pair',
			keyword: '_',
			operator: ':',
			values: value.eval()
		};
	},
	value(child) {
		return child.eval();
	},
	valueExp(child) {
		return child.eval();
	},
	valueExp_and_or(valueExp, conjunctionSymbol, valueLiteral) {
		return {
			type: 'value_comb',
			op: conjunctionSymbol.sourceString.trim(),
			left: valueExp.eval(),
			right: valueLiteral.eval()
		};
	},
	valueLiteral(child) {
		return child.eval();
	},
	// oxlint-disable-next-line no-unused-vars
	valueLiteral_paren(openParen, spaces1, parenTerm, spaces2, closeParen) {
		return parenTerm.eval();
	},
	// oxlint-disable-next-line no-unused-vars
	stringLiteral(openQuote, chars, closeQuote) {
		const raw = chars.sourceString;
		const unescaped = raw.replace(/\\(.)/g, '$1');
		return {
			type: 'literal',
			value: unescaped,
			is_regex: false
		};
	},
	// oxlint-disable-next-line no-unused-vars
	regularExpressionLiteral(openSlash, body, closeSlash) {
		return {
			type: 'literal',
			value: body.sourceString,
			is_regex: true
		};
	},
	nonSpacedLiteral(chars) {
		return {
			type: 'literal',
			value: chars.sourceString,
			is_regex: false
		};
	},
	parenTerm(child) {
		return child.eval();
	},
	parenTerm_and_or(value1, spaces1, conjunctionSymbol, spaces2, value2) {
		return {
			type: 'value_comb',
			op: conjunctionSymbol.sourceString.trim(),
			left: value1.eval(),
			right: value2.eval()
		};
	},
	_terminal() {
		return this.sourceString;
	}
});

function stripText(text: string): string {
	return (
		text
			.toLowerCase()
			.normalize('NFD')
			// oxlint-disable-next-line no-control-regex
			.replace(/[^\x00-\x7F]/g, '')
	);
}

function hasRegex(valuesNode: any): boolean {
	if (valuesNode.type === 'literal') {
		return !!valuesNode.is_regex;
	}
	if (valuesNode.type === 'value_comb') {
		return hasRegex(valuesNode.left) || hasRegex(valuesNode.right);
	}
	return false;
}

function compileNode(node: any, fields: FieldData[], where_values: string[]): string {
	switch (node.type) {
		case 'conjunction': {
			const left = compileNode(node.left, fields, where_values);
			const right = compileNode(node.right, fields, where_values);
			const op = node.op.toUpperCase();
			return `${left} ${op} ${right}`;
		}
		case 'bracketed': {
			const child = compileNode(node.child, fields, where_values);
			if (node.child && node.child.type === 'bracketed') {
				return child;
			}
			return `(${child})`;
		}
		case 'negate': {
			const child = compileNode(node.child, fields, where_values);
			return `NOT ${child}`;
		}
		case 'pair': {
			const keyword = node.keyword;
			const operator = node.operator;

			const field = fields.find((f) => f.keywords.includes(keyword));
			if (!field) {
				throw new Error(`Unknown keyword ${keyword}`);
			}

			const isRegexVal = hasRegex(node.values);
			const fieldTypeForOp = isRegexVal ? 'regex' : field.type;

			const operatorsForType = (OPERATORS as any)[fieldTypeForOp];
			if (!operatorsForType || !(operator in operatorsForType)) {
				throw new Error(`Invalid ${field.type} operator "${operator}"`);
			}

			const context = {
				field,
				operator,
				negative_op: operator === '!',
				keyword
			};

			return compileValues(node.values, context, where_values);
		}
		default:
			throw new Error(`Unknown AST node type: ${node.type}`);
	}
}

function compileValues(
	valuesNode: any,
	context: { field: FieldData; operator: string; negative_op: boolean; keyword: string },
	where_values: string[]
): string {
	if (valuesNode.type === 'literal') {
		return compileLiteral(valuesNode, context, where_values);
	} else if (valuesNode.type === 'value_comb') {
		let connector: string;
		if (valuesNode.op === '&') {
			connector = ' and ';
		} else {
			connector = context.negative_op ? ' and ' : ' or ';
		}
		const left = compileValues(valuesNode.left, context, where_values);
		const right = compileValues(valuesNode.right, context, where_values);
		return `(${left}${connector}${right})`;
	} else {
		throw new Error(`Unknown values node type: ${valuesNode.type}`);
	}
}

function compileLiteral(
	valuesNode: any,
	context: { field: FieldData; operator: string; negative_op: boolean; keyword: string },
	where_values: string[]
): string {
	if (context.field.type !== 'string' && valuesNode.is_regex) {
		throw new Error(
			`${context.field.type} field does not accept regular expressions but was passed ${valuesNode.value}`
		);
	}

	const fieldTypeForOp = valuesNode.is_regex ? 'regex' : context.field.type;
	const sql_operator = (OPERATORS as any)[fieldTypeForOp][context.operator];

	switch (context.field.type) {
		case 'array': {
			let val = valuesNode.value;
			if (/^[a-zA-Z0-9_]+-\d+$/.test(val)) {
				val = val.replace('-', '=');
			}
			where_values.push(val);
			if (context.operator === '!') {
				return `NOT EXISTS (SELECT 1 FROM json_each(${context.field.sql}) WHERE value = ?)`;
			} else {
				return `EXISTS (SELECT 1 FROM json_each(${context.field.sql}) WHERE value = ?)`;
			}
		}
		case 'boolean': {
			const val = valuesNode.value.toLowerCase();
			if (!['true', 'false', 't', 'f', '1', '0', 'any'].includes(val)) {
				throw new Error(
					`Invalid value "${valuesNode.value}" for boolean field "${context.keyword}"`
				);
			}
			where_values.push(valuesNode.value);
			return `${context.field.sql} ${sql_operator} ?`;
		}
		case 'date': {
			let val = valuesNode.value.toLowerCase();
			if (val === 'now') {
				const now = new Date();
				const yyyy = now.getFullYear();
				const mm = String(now.getMonth() + 1).padStart(2, '0');
				const dd = String(now.getDate()).padStart(2, '0');
				val = `${yyyy}-${mm}-${dd}`;
			} else if (!/^\d{4}-\d{2}-\d{2}$|^\d{8}$/.test(val)) {
				throw new Error(
					`Invalid value "${val}" for date field "${context.keyword}" - only YYYY-MM-DD or YYYYMMDD are supported.`
				);
			}
			where_values.push(val);
			return `${context.field.sql} ${sql_operator} ?`;
		}
		case 'format': {
			if (sql_operator === 'FORMAT') {
				let format_id = valuesNode.value.toLowerCase();
				const force_latest = format_id.endsWith('-latest');
				if (force_latest) {
					format_id = format_id.slice(0, -7);
				}
				where_values.push(format_id);
				where_values.push(format_id);
				const filter = force_latest ? 'ORDER BY date_start DESC LIMIT 1' : 'AND active = 1';
				const table = context.field.sql.split('.')[0];
				return (
					`EXISTS (SELECT 1 FROM json_each(${table}.snapshot_ids) WHERE value = (SELECT id FROM snapshots WHERE format_id = ? ${filter})) ` +
					`AND NOT EXISTS (SELECT 1 FROM json_each(${table}.restrictions_banned) WHERE value = (SELECT restriction_id FROM snapshots WHERE format_id = ? ${filter}))`
				);
			}
			throw new Error(`Invalid format operator "${context.operator}"`);
		}
		case 'integer': {
			if (!/^(?:\d+|x)$/i.test(valuesNode.value)) {
				throw new Error(
					`Invalid value "${valuesNode.value}" for integer field "${context.keyword}"`
				);
			}
			const val = valuesNode.value.toLowerCase() === 'x' ? '-1' : valuesNode.value;
			where_values.push(val);
			return `${context.field.sql} ${sql_operator} ?`;
		}
		case 'string': {
			if (valuesNode.is_regex) {
				where_values.push(valuesNode.value);
				return `${context.field.sql} ${sql_operator} ?`;
			} else {
				where_values.push(`%${stripText(valuesNode.value)}%`);
				return `lower(${context.field.sql}) ${sql_operator} ?`;
			}
		}
		default:
			throw new Error(`Unknown query type "${context.field.type}"`);
	}
}

export class SearchQueryBuilder {
	where: string = '';
	where_values: string[] = [];
	parse_error: Error | null = null;

	constructor(query: string, fields: FieldData[]) {
		const matchResult = queryGrammar.match(query);
		if (matchResult.failed()) {
			this.parse_error = new Error(matchResult.message);
			return;
		}
		const ast = semantics(matchResult).eval();
		this.where = compileNode(ast, fields, this.where_values);
	}
}

export class CardSearchQueryBuilder extends SearchQueryBuilder {
	constructor(query: string) {
		const cardFields: FieldData[] = fullFields
			.filter((f) => f.sql.c !== undefined)
			.map((f) => ({
				type: f.type,
				sql: f.sql.c!,
				keywords: f.keywords
			}));
		super(query, cardFields);
	}
}

export class PrintingSearchQueryBuilder extends SearchQueryBuilder {
	constructor(query: string) {
		const printingFields: FieldData[] = fullFields
			.filter((f) => f.sql.p !== undefined)
			.map((f) => ({
				type: f.type,
				sql: f.sql.p!,
				keywords: f.keywords
			}));
		super(query, printingFields);
	}
}
