import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class User {
    constructor(props?: Partial<User>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    balance!: bigint

    @Column_("int4", {array: true, nullable: false})
    ownedToken!: (number)[]
}
